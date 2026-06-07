/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate()
)

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({ cacheName: 'pages-cache' })
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