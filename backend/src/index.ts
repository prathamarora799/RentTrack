import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import webpush from 'web-push'
import Database from './config/database'
import { notificationSubject, pushObserver } from './config/notificationObserver'
import authRoutes from './routes/authRoutes'
import paymentRoutes from './routes/paymentRoutes'
import userRoutes from './routes/userRoutes'
import notificationRoutes from './routes/notificationRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Serve uploaded proof images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Set VAPID details for push notifications
webpush.setVapidDetails(
  'mailto:renttrack@gmail.com',
  process.env.VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
)

// Register Observer Pattern  push observer listens to notification events
notificationSubject.subscribe(pushObserver)
console.log('[OBSERVER] Push notification observer registered ✅')

// Register all API routes
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'RentTrack API running ✅' })
})

// Connect to MongoDB using Singleton Pattern
const db = Database.getInstance()
db.connect(process.env.MONGODB_URI as string)
  .catch((err) => console.error(`[DB] Failed to connect: ${err}`))

// Start the server
app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`)
})

export default app