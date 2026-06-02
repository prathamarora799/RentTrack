/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Cache all files automatically
precacheAndRoute(self.__WB_MANIFEST)

// Cache JS and CSS files
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate()
)

// Cache pages for offline access
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({ cacheName: 'renttrack-pages-cache' })
)

// Push notification handler
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
      icon: '/vite.svg'
    })
  )
})

self.addEventListener('install', () => {
  console.log('RentTrack SW installed ✅')
})

self.addEventListener('activate', () => {
  console.log('RentTrack SW activated ✅')
})