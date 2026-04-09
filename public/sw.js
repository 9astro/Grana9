const CACHE_NAME = 'grana9-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
]

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Cache addAll error:', err)
          return Promise.resolve()
        })
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - Network first, then cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other non-http protocols
  if (!event.request.url.startsWith('http')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response
            }
            
            // Return a generic offline response for document requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html')
            }
            
            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
  )
})

// Handle background sync for offline submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  try {
    // Sync logic would go here if needed
    console.log('Data synced')
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {}
  const options = {
    body: data.body || 'Grana9 notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'grana9-notification'
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Grana9', options)
  )
})
