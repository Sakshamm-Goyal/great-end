/**
 * Virtualization utilities for handling large datasets
 * Optimizes rendering performance for 50+ activities
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number; // Minimum items before virtualization kicks in
}

export interface VirtualizationResult<T> {
  virtualItems: VirtualItem[];
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  scrollToOffset: (offset: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollElementRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for virtualizing large lists
 * Only activates when item count exceeds threshold
 */
export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
): VirtualizationResult<T> {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 50,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Only virtualize if we have enough items
  const shouldVirtualize = items.length > threshold;

  const virtualItems = useMemo(() => {
    if (!shouldVirtualize) {
      return items.map((_, index) => ({
        index,
        start: index * itemHeight,
        end: (index + 1) * itemHeight,
        size: itemHeight,
      }));
    }

    const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollOffset + containerHeight) / itemHeight) + overscan
    );

    const virtualItems: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        size: itemHeight,
      });
    }

    return virtualItems;
  }, [items.length, itemHeight, containerHeight, scrollOffset, overscan, shouldVirtualize]);

  const totalHeight = items.length * itemHeight;

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const targetOffset = index * itemHeight;
    containerRef.current.scrollTop = targetOffset;
  }, [itemHeight]);

  const scrollToOffset = useCallback((offset: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = offset;
  }, []);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldVirtualize) return;

    const handleScroll = () => {
      setScrollOffset(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [shouldVirtualize]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    scrollToOffset,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    scrollElementRef: scrollElementRef as React.RefObject<HTMLDivElement>,
  };
}

/**
 * Hook for virtualizing timeline activities
 * Handles variable heights and complex layouts
 */
export function useTimelineVirtualization(
  activities: any[],
  config: {
    containerHeight: number;
    minItemHeight: number;
    maxItemHeight: number;
    threshold?: number;
  }
) {
  const {
    containerHeight,
    minItemHeight,
    maxItemHeight,
    threshold = 30,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);

  const shouldVirtualize = activities.length > threshold;

  // Calculate item heights based on content
  const calculateItemHeight = useCallback((activity: any) => {
    let baseHeight = minItemHeight;
    
    // Adjust height based on content
    if (activity.notes && activity.notes.length > 50) {
      baseHeight += 20;
    }
    if (activity.mood) {
      baseHeight += 15;
    }
    if (activity.durationMins > 120) {
      baseHeight += 10;
    }

    return Math.min(Math.max(baseHeight, minItemHeight), maxItemHeight);
  }, [minItemHeight, maxItemHeight]);

  // Update item heights when activities change
  useEffect(() => {
    const heights = activities.map(calculateItemHeight);
    setItemHeights(heights);
  }, [activities, calculateItemHeight]);

  const virtualItems = useMemo(() => {
    if (!shouldVirtualize) {
      return activities.map((_, index) => ({
        index,
        start: itemHeights.slice(0, index).reduce((sum, height) => sum + height, 0),
        end: itemHeights.slice(0, index + 1).reduce((sum, height) => sum + height, 0),
        size: itemHeights[index] || minItemHeight,
      }));
    }

    let currentOffset = 0;
    let startIndex = 0;
    let endIndex = activities.length - 1;

    // Find start index
    for (let i = 0; i < activities.length; i++) {
      const itemHeight = itemHeights[i] || minItemHeight;
      if (currentOffset + itemHeight > scrollOffset) {
        startIndex = Math.max(0, i - 5); // overscan
        break;
      }
      currentOffset += itemHeight;
    }

    // Find end index
    currentOffset = 0;
    for (let i = 0; i < activities.length; i++) {
      const itemHeight = itemHeights[i] || minItemHeight;
      currentOffset += itemHeight;
      if (currentOffset > scrollOffset + containerHeight) {
        endIndex = Math.min(activities.length - 1, i + 5); // overscan
        break;
      }
    }

    const virtualItems: VirtualItem[] = [];
    let offset = 0;
    
    for (let i = 0; i < activities.length; i++) {
      const itemHeight = itemHeights[i] || minItemHeight;
      
      if (i >= startIndex && i <= endIndex) {
        virtualItems.push({
          index: i,
          start: offset,
          end: offset + itemHeight,
          size: itemHeight,
        });
      }
      
      offset += itemHeight;
    }

    return virtualItems;
  }, [activities, itemHeights, scrollOffset, containerHeight, minItemHeight, shouldVirtualize]);

  const totalHeight = itemHeights.reduce((sum, height) => sum + height, 0);

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const targetOffset = itemHeights.slice(0, index).reduce((sum, height) => sum + height, 0);
    containerRef.current.scrollTop = targetOffset;
  }, [itemHeights]);

  const scrollToOffset = useCallback((offset: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = offset;
  }, []);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldVirtualize) return;

    const handleScroll = () => {
      setScrollOffset(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [shouldVirtualize]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    scrollToOffset,
    containerRef,
  };
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private static debounceTimers = new Map<string, NodeJS.Timeout>();
  private static throttleTimers = new Map<string, boolean>();

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key?: string
  ): T {
    const timerKey = key || func.name || 'anonymous';
    
    return ((...args: Parameters<T>) => {
      if (this.debounceTimers.has(timerKey)) {
        clearTimeout(this.debounceTimers.get(timerKey)!);
      }
      
      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(timerKey);
      }, delay);
      
      this.debounceTimers.set(timerKey, timer);
    }) as T;
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key?: string
  ): T {
    const timerKey = key || func.name || 'anonymous';
    let lastCallTime = 0;
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallTime >= delay) {
        lastCallTime = now;
        func(...args);
      }
    }) as T;
  }

  static memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  static cleanup() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.throttleTimers.clear();
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static cleanupCallbacks = new Set<() => void>();
  private static memoryThreshold = 50 * 1024 * 1024; // 50MB

  static registerCleanup(callback: () => void) {
    this.cleanupCallbacks.add(callback);
  }

  static unregisterCleanup(callback: () => void) {
    this.cleanupCallbacks.delete(callback);
  }

  static cleanup() {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });
  }

  static checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      
      if (used > this.memoryThreshold) {
        console.warn('High memory usage detected, triggering cleanup');
        this.cleanup();
      }
    }
  }

  static scheduleCleanup() {
    // Clean up every 5 minutes
    setInterval(() => {
      this.checkMemoryUsage();
    }, 5 * 60 * 1000);
  }
}

// Initialize memory management
if (typeof window !== 'undefined') {
  MemoryManager.scheduleCleanup();
}
