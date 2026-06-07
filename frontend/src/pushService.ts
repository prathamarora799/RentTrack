// Convert base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// Subscribe to push notifications
export const subscribeToPush = async (token: string) => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push not supported')
      return
    }

    // Permission maango
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permission denied')
      return
    }

    // Get VAPID public key from backend
    const keyRes = await fetch('http://localhost:5000/api/notifications/vapid-public-key')
    const { publicKey } = await keyRes.json()

    // Service worker ready hone ka wait karo
    const registration = await navigator.serviceWorker.ready

    // Subscribe karo
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })

    // Backend mein save karo
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

// Send welcome notification
export const sendWelcomeNotification = (name: string) => {
  if (Notification.permission === 'granted') {
    new Notification('Welcome to RentTrack! 🏠', {
      body: `Hi ${name}! Your account is ready. Never miss a rent payment again.`,
      icon: '/vite.svg'
    })
  }
}