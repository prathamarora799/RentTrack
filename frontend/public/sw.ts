/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

// Cache JS and CSS files
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate()
)

// Use NetworkFirst for navigation so pages always load fresh
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages-cache' })
)

// Push notification receive karo
self.addEventListener('push', (event) => {
  console.log('Push received ✅')
  let data = { title: 'RentTrack', body: 'You have a notification' }

  try {
    data = event.data!.json()
  } catch (e) {
    console.log('Push parse error:', e)
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/vite.svg',
      badge: '/vite.svg'
    })
  )
})

self.addEventListener('install', () => {
  console.log('Service Worker Installed ✅')
})

self.addEventListener('activate', () => {
  console.log('Service Worker Activated ✅')
})