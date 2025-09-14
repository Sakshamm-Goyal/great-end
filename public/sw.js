/**
 * Service Worker for Weekendly
 * Provides offline support and caching
 */

const CACHE_NAME = 'weekendly-v1';
const STATIC_CACHE_NAME = 'weekendly-static-v1';
const DYNAMIC_CACHE_NAME = 'weekendly-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/offline.html',
  // Add other static assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\//,
  // Add other API patterns as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Try cache first for static assets
    if (isStaticAsset(url)) {
      const cachedResponse = await getFromCache(request, STATIC_CACHE_NAME);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Try network first for API requests
    if (isApiRequest(url)) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          // Cache successful API responses
          await cacheResponse(request, networkResponse.clone(), DYNAMIC_CACHE_NAME);
        }
        return networkResponse;
      } catch (error) {
        // Fallback to cache for API requests
        const cachedResponse = await getFromCache(request, DYNAMIC_CACHE_NAME);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    }

    // For other requests, try network first, then cache
    try {
      const networkResponse = await fetch(request);
      
      // Cache successful responses
      if (networkResponse.ok) {
        await cacheResponse(request, networkResponse.clone(), DYNAMIC_CACHE_NAME);
      }
      
      return networkResponse;
    } catch (error) {
      // Network failed, try cache
      const cachedResponse = await getFromCache(request, DYNAMIC_CACHE_NAME);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If it's a page request and we have no cache, show offline page
      if (request.destination === 'document') {
        return caches.match('/offline.html');
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Fetch failed:', error);
    
    // Return offline page for document requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    // Return a basic error response for other requests
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

async function getFromCache(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    return response;
  } catch (error) {
    console.error('Cache retrieval failed:', error);
    return null;
  }
}

async function cacheResponse(request, response, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (error) {
    console.error('Cache storage failed:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to process pending action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingActions() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

async function processPendingAction(action) {
  // Process the pending action (e.g., sync with server)
  console.log('Processing pending action:', action);
}

async function removePendingAction(actionId) {
  // Remove the processed action from IndexedDB
  console.log('Removing pending action:', actionId);
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'weekendly-notification',
      data: data.data,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then(cache => cache.addAll(urls))
    );
  }
});

// Periodic cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  try {
    const cacheNames = await caches.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const cacheName of cacheNames) {
      if (cacheName.startsWith('weekendly-dynamic-')) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          const dateHeader = response.headers.get('date');
          
          if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (now - responseDate > maxAge) {
              await cache.delete(request);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}
