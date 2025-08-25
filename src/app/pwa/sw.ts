/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

// Cache names
const CACHE_NAME = 'bazari-v1'
const STATIC_CACHE = 'bazari-static-v1'
const DYNAMIC_CACHE = 'bazari-dynamic-v1'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Activated and ready')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache with fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache opaque responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone()

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })

            return networkResponse
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/')
            }
            
            // Return offline fallback for other requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
  )
})

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations here
      Promise.resolve()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'Nova notificação do Bazari',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: data.url || '/',
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/pwa-192x192.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Bazari', options)
    )
  }
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const url = event.notification.data || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window if app is not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})