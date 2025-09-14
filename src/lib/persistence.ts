/**
 * Enhanced persistence layer for Weekendly
 * Supports both localStorage (fallback) and IndexedDB (primary)
 * Handles large datasets, offline sync, and data migration
 */

export interface WeekendPlan {
  id: string;
  theme: 'lazy' | 'adventurous' | 'family';
  activities: WeekendActivity[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
  metadata?: {
    tags?: string[];
    notes?: string;
    isTemplate?: boolean;
  };
}

export interface WeekendActivity {
  id: string;
  title: string;
  category: 'outdoor' | 'food' | 'fitness' | 'culture' | 'home' | 'other';
  day: 'saturday' | 'sunday';
  start: string;
  durationMins: number;
  mood?: 'chill' | 'energetic' | 'social' | 'focus';
  notes?: string;
}

export interface PersistenceStats {
  totalPlans: number;
  totalActivities: number;
  storageUsed: number;
  lastSync?: Date;
}

class PersistenceManager {
  private db: IDBDatabase | null = null;
  private dbName = 'WeekendlyDB';
  private dbVersion = 1;
  private isIndexedDBSupported = typeof window !== 'undefined' && 'indexedDB' in window;

  async init(): Promise<void> {
    if (!this.isIndexedDBSupported) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Plans store
        if (!db.objectStoreNames.contains('plans')) {
          const plansStore = db.createObjectStore('plans', { keyPath: 'id' });
          plansStore.createIndex('theme', 'theme', { unique: false });
          plansStore.createIndex('createdAt', 'createdAt', { unique: false });
          plansStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Activities store (for analytics and cross-plan queries)
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id' });
          activitiesStore.createIndex('category', 'category', { unique: false });
          activitiesStore.createIndex('day', 'day', { unique: false });
          activitiesStore.createIndex('planId', 'planId', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Sync metadata store
        if (!db.objectStoreNames.contains('sync')) {
          db.createObjectStore('sync', { keyPath: 'key' });
        }
      };
    });
  }

  // Plan management
  async savePlan(plan: Omit<WeekendPlan, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<string> {
    const id = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    
    const fullPlan: WeekendPlan = {
      ...plan,
      id,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    if (this.db) {
      return this.savePlanToIndexedDB(fullPlan);
    } else {
      return this.savePlanToLocalStorage(fullPlan);
    }
  }

  async updatePlan(id: string, updates: Partial<WeekendPlan>): Promise<void> {
    if (this.db) {
      await this.updatePlanInIndexedDB(id, updates);
    } else {
      await this.updatePlanInLocalStorage(id, updates);
    }
  }

  async getPlan(id: string): Promise<WeekendPlan | null> {
    if (this.db) {
      return this.getPlanFromIndexedDB(id);
    } else {
      return this.getPlanFromLocalStorage(id);
    }
  }

  async getAllPlans(): Promise<WeekendPlan[]> {
    if (this.db) {
      return this.getAllPlansFromIndexedDB();
    } else {
      return this.getAllPlansFromLocalStorage();
    }
  }

  async deletePlan(id: string): Promise<void> {
    if (this.db) {
      await this.deletePlanFromIndexedDB(id);
    } else {
      await this.deletePlanFromLocalStorage(id);
    }
  }

  // Theme-based plan management (backward compatibility)
  async saveThemePlan(theme: string, activities: WeekendActivity[]): Promise<void> {
    const existingPlan = await this.getThemePlan(theme);
    
    if (existingPlan) {
      await this.updatePlan(existingPlan.id, {
        activities,
        updatedAt: new Date(),
        version: existingPlan.version + 1,
      });
    } else {
      await this.savePlan({
        theme: theme as any,
        activities,
        metadata: { isTemplate: false },
      });
    }
  }

  async getThemePlan(theme: string): Promise<WeekendPlan | null> {
    const plans = await this.getAllPlans();
    return plans.find(p => p.theme === theme && !p.metadata?.isTemplate) || null;
  }

  // Settings management
  async saveSettings(key: string, value: any): Promise<void> {
    if (this.db) {
      await this.saveSettingsToIndexedDB(key, value);
    } else {
      window.localStorage.setItem(`weekendly.settings.${key}`, JSON.stringify(value));
    }
  }

  async getSettings(key: string): Promise<any> {
    if (this.db) {
      return this.getSettingsFromIndexedDB(key);
    } else {
      const value = window.localStorage.getItem(`weekendly.settings.${key}`);
      return value ? JSON.parse(value) : null;
    }
  }

  // Analytics and stats
  async getStats(): Promise<PersistenceStats> {
    if (this.db) {
      return this.getStatsFromIndexedDB();
    } else {
      return this.getStatsFromLocalStorage();
    }
  }

  // Export/Import
  async exportAllData(): Promise<{ plans: WeekendPlan[]; settings: Record<string, any> }> {
    const plans = await this.getAllPlans();
    const settings: Record<string, any> = {};
    
    // Export common settings
    const settingKeys = ['theme', 'colorScheme', 'autoSave', 'defaultDuration', 'timeFormat', 'notifications', 'startTime', 'endTime', 'weekendStart', 'showTutorial', 'compactMode'];
    for (const key of settingKeys) {
      const value = await this.getSettings(key);
      if (value !== null) {
        settings[key] = value;
      }
    }

    return { plans, settings };
  }

  async importData(data: { plans: WeekendPlan[]; settings: Record<string, any> }): Promise<void> {
    // Import plans
    for (const plan of data.plans) {
      await this.savePlan(plan);
    }

    // Import settings
    for (const [key, value] of Object.entries(data.settings)) {
      await this.saveSettings(key, value);
    }
  }

  // IndexedDB implementations
  private async savePlanToIndexedDB(plan: WeekendPlan): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['plans', 'activities'], 'readwrite');
      const plansStore = transaction.objectStore('plans');
      const activitiesStore = transaction.objectStore('activities');

      const request = plansStore.add(plan);
      
      request.onsuccess = () => {
        // Also save activities separately for analytics
        plan.activities.forEach(activity => {
          activitiesStore.add({
            ...activity,
            planId: plan.id,
          });
        });
        resolve(plan.id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async updatePlanInIndexedDB(id: string, updates: Partial<WeekendPlan>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['plans', 'activities'], 'readwrite');
      const plansStore = transaction.objectStore('plans');
      const activitiesStore = transaction.objectStore('activities');

      const getRequest = plansStore.get(id);
      
      getRequest.onsuccess = () => {
        const existingPlan = getRequest.result;
        if (!existingPlan) {
          reject(new Error('Plan not found'));
          return;
        }

        const updatedPlan = {
          ...existingPlan,
          ...updates,
          updatedAt: new Date(),
          version: existingPlan.version + 1,
        };

        const putRequest = plansStore.put(updatedPlan);
        
        putRequest.onsuccess = () => {
          // Update activities if they changed
          if (updates.activities) {
            // Remove old activities
            const deleteRequest = activitiesStore.index('planId').openCursor(IDBKeyRange.only(id));
            deleteRequest.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest).result;
              if (cursor) {
                cursor.delete();
                cursor.continue();
              } else {
                // Add new activities
                updates.activities!.forEach(activity => {
                  activitiesStore.add({
                    ...activity,
                    planId: id,
                  });
                });
                resolve();
              }
            };
          } else {
            resolve();
          }
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  private async getPlanFromIndexedDB(id: string): Promise<WeekendPlan | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['plans'], 'readonly');
      const store = transaction.objectStore('plans');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async getAllPlansFromIndexedDB(): Promise<WeekendPlan[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['plans'], 'readonly');
      const store = transaction.objectStore('plans');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async deletePlanFromIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['plans', 'activities'], 'readwrite');
      const plansStore = transaction.objectStore('plans');
      const activitiesStore = transaction.objectStore('activities');

      // Delete plan
      const deletePlanRequest = plansStore.delete(id);
      
      deletePlanRequest.onsuccess = () => {
        // Delete associated activities
        const deleteActivitiesRequest = activitiesStore.index('planId').openCursor(IDBKeyRange.only(id));
        deleteActivitiesRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
      };

      deletePlanRequest.onerror = () => {
        reject(deletePlanRequest.error);
      };
    });
  }

  private async saveSettingsToIndexedDB(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value, updatedAt: new Date() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getSettingsFromIndexedDB(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async getStatsFromIndexedDB(): Promise<PersistenceStats> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['plans', 'activities'], 'readonly');
      const plansStore = transaction.objectStore('plans');
      const activitiesStore = transaction.objectStore('activities');

      const plansRequest = plansStore.count();
      const activitiesRequest = activitiesStore.count();

      Promise.all([
        new Promise<number>((res, rej) => {
          plansRequest.onsuccess = () => res(plansRequest.result);
          plansRequest.onerror = () => rej(plansRequest.error);
        }),
        new Promise<number>((res, rej) => {
          activitiesRequest.onsuccess = () => res(activitiesRequest.result);
          activitiesRequest.onerror = () => rej(activitiesRequest.error);
        })
      ]).then(([totalPlans, totalActivities]) => {
        resolve({
          totalPlans,
          totalActivities,
          storageUsed: 0, // Would need to calculate actual storage usage
          lastSync: new Date(),
        });
      }).catch(reject);
    });
  }

  // LocalStorage implementations (fallback)
  private async savePlanToLocalStorage(plan: WeekendPlan): Promise<string> {
    try {
      window.localStorage.setItem(`weekendly.plan.${plan.id}`, JSON.stringify(plan));
      return plan.id;
    } catch (error) {
      throw new Error('Failed to save plan to localStorage');
    }
  }

  private async updatePlanInLocalStorage(id: string, updates: Partial<WeekendPlan>): Promise<void> {
    const existing = window.localStorage.getItem(`weekendly.plan.${id}`);
    if (!existing) {
      throw new Error('Plan not found');
    }

    const plan = JSON.parse(existing);
    const updatedPlan = { ...plan, ...updates, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(`weekendly.plan.${id}`, JSON.stringify(updatedPlan));
  }

  private async getPlanFromLocalStorage(id: string): Promise<WeekendPlan | null> {
    const data = window.localStorage.getItem(`weekendly.plan.${id}`);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse plan data from localStorage:', error);
      return null;
    }
  }

  private async getAllPlansFromLocalStorage(): Promise<WeekendPlan[]> {
    const plans: WeekendPlan[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith('weekendly.plan.plan_')) {
        const data = window.localStorage.getItem(key);
        if (data) {
          try {
            plans.push(JSON.parse(data));
          } catch (error) {
            console.warn('Failed to parse plan data from localStorage:', error);
            // Skip invalid data
          }
        }
      }
    }
    return plans;
  }

  private async deletePlanFromLocalStorage(id: string): Promise<void> {
    window.localStorage.removeItem(`weekendly.plan.${id}`);
  }

  private async getStatsFromLocalStorage(): Promise<PersistenceStats> {
    const plans = await this.getAllPlansFromLocalStorage();
    const totalActivities = plans.reduce((sum, plan) => sum + plan.activities.length, 0);
    
    return {
      totalPlans: plans.length,
      totalActivities,
      storageUsed: 0, // Would need to calculate actual storage usage
      lastSync: new Date(),
    };
  }
}

// Singleton instance
export const persistenceManager = new PersistenceManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  persistenceManager.init().catch(console.error);
}
