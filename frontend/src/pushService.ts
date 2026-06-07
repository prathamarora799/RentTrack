// Convert base64 string to Uint8Array for the push subscription
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// Subscribe the user to push notifications
export const subscribeToPush = async (token: string) => {
  try {
    // Check if the browser supports push notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push not supported in this browser')
      return
    }

    // Ask the user for notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('User denied notification permission')
      return
    }

    // Get the VAPID public key from our backend
    const keyRes = await fetch('http://localhost:5000/api/notifications/vapid-public-key')
    const { publicKey } = await keyRes.json()

    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready

    // Create a push subscription using the public key
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })

    // Send the subscription to the backend to save it
    await fetch('http://localhost:5000/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(subscription)
    })

    console.log('Push subscription saved ✅')

  } catch (err) {
    console.log('Push subscription error:', err)
  }
}

// Show a welcome notification right in the browser
export const sendWelcomeNotification = (name: string) => {
  if (Notification.permission === 'granted') {
    new Notification('Welcome to RentTrack! 🏠', {
      body: `Hi ${name}! Your account is ready. Never miss a rent payment again.`,
      icon: '/vite.svg'
    })
  }
}