import webpush from 'web-push'

// Every observer must have an update method
interface Observer {
  update(event: string, data: any): void
}

// Subject keeps a list of observers and tells them when events happen
class NotificationSubject {
  private observers: Observer[] = []

  // Add observer to the list
  public subscribe(observer: Observer): void {
    this.observers.push(observer)
    console.log('[OBSERVER] New observer registered')
  }

  // Tell all observers something happened
  public notify(event: string, data: any): void {
    console.log(`[OBSERVER] Notifying observers for event: ${event}`)
    this.observers.forEach(observer => observer.update(event, data))
  }
}

// This observer sends push notifications when it gets called
class PushNotificationObserver implements Observer {

  public update(event: string, data: any): void {

    // Landlord gets notified when tenant adds a payment
    if (event === 'payment_added' && data.landlordSubscription) {
      const payload = JSON.stringify({
        title: 'New Payment Received 💰',
        body: `${data.tenantName} paid $${data.amount} for ${data.month}`
      })
      webpush.sendNotification(data.landlordSubscription, payload)
        .then(() => console.log('[PUSH] Landlord notified'))
        .catch((err) => console.error(`[PUSH] Failed: ${err}`))
    }

    // Tenant gets notified when landlord confirms payment
    if (event === 'payment_confirmed' && data.tenantSubscription) {
      const payload = JSON.stringify({
        title: 'Payment Confirmed ✅',
        body: `Your payment of $${data.amount} for ${data.month} is confirmed!`
      })
      webpush.sendNotification(data.tenantSubscription, payload)
        .then(() => console.log('[PUSH] Tenant notified — confirmed'))
        .catch((err) => console.error(`[PUSH] Failed: ${err}`))
    }

    // Tenant gets notified when landlord flags payment
    if (event === 'payment_flagged' && data.tenantSubscription) {
      const payload = JSON.stringify({
        title: 'Payment Flagged 🚩',
        body: `Your payment of $${data.amount} for ${data.month} was flagged.`
      })
      webpush.sendNotification(data.tenantSubscription, payload)
        .then(() => console.log('[PUSH] Tenant notified — flagged'))
        .catch((err) => console.error(`[PUSH] Failed: ${err}`))
    }
  }
}

// Create the subject and observer
export const notificationSubject = new NotificationSubject()
export const pushObserver = new PushNotificationObserver()

// Register the observer with the subject
notificationSubject.subscribe(pushObserver)