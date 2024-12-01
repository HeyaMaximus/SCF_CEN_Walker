// service-worker.js

const CACHE_NAME = 'drawchat-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/offline-page.html',
    '/MaximusCapstone.png'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
            .catch((error) => console.error('Error caching assets during install:', error))
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
            .catch((error) => console.error('Error during activation:', error))
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache).catch((error) =>
                                console.error('Failed to cache new resource:', error)
                            );
                        });

                        return networkResponse;
                    });
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline-page.html');
                }
            })
    );
});

// Background sync for messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New message received',
        icon: '/MaximusCapstone.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'explore', title: 'Open DrawChat' },
            { action: 'close', title: 'Close' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('MaximusDrawChat', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Sync messages (stubbed implementation)
async function syncMessages() {
    try {
        const messages = await getQueuedMessages();
        for (const message of messages) {
            await sendMessage(message);
        }
        await clearQueuedMessages();
    } catch (error) {
        console.error('Error syncing messages:', error);
    }
}

// Helper functions for IndexedDB operations (stubbed for future implementation)
async function getQueuedMessages() {
    // Stub for fetching queued messages
    return [];
}

async function sendMessage(message) {
    // Stub for sending messages to the server
    console.log('Sending message:', message);
}

async function clearQueuedMessages() {
    // Stub for clearing queued messages
    console.log('Queued messages cleared.');
}
