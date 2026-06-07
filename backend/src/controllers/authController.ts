import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import webpush from 'web-push'
import User from '../models/User'

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    console.log(`[REGISTER] Attempt - Email: ${email}, Role: ${role}`)

    // All fields must be filled
    if (!name || !email || !password) {
      console.warn('[REGISTER] Failed - Missing fields')
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Email must be in correct format
    if (!/\S+@\S+\.\S+/.test(email)) {
      console.warn(`[REGISTER] Failed - Invalid email: ${email}`)
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Password needs to be at least 6 characters
    if (password.length < 6) {
      console.warn(`[REGISTER] Failed - Short password for: ${email}`)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Stop if email is already registered
    const existing = await User.findOne({ email })
    if (existing) {
      console.warn(`[REGISTER] Failed - Email exists: ${email}`)
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Hash the password before saving — never store plain text
    const hashed = await bcrypt.hash(password, 10)

    // Save new user to database
    const user = await User.create({ name, email, password: hashed, role })
    console.log(`[REGISTER] Success - New user: ${email} as ${role}`)

    // Send welcome push notification if user already has a subscription
    if (user.pushSubscription) {
      try {
        await webpush.sendNotification(
          user.pushSubscription as any,
          JSON.stringify({
            title: 'Welcome to RentTrack! 🏠',
            body: `Hi ${name}! Your account is ready.`
          })
        )
        console.log(`[PUSH] Welcome notification sent to: ${email}`)
      } catch {
        console.warn(`[PUSH] Welcome notification failed for: ${email}`)
      }
    }

    res.status(201).json({ message: 'Registered successfully' })

  } catch (err) {
    console.error(`[REGISTER] Error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}

// Log in an existing user and return a JWT token
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    console.log(`[LOGIN] Attempt - Email: ${email}`)

    // Both fields are required
    if (!email || !password) {
      console.warn('[LOGIN] Failed - Missing fields')
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Check if this user exists in the database
    const user = await User.findOne({ email })
    if (!user) {
      console.warn(`[LOGIN] Failed - User not found: ${email}`)
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Compare the entered password with the hashed one
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      console.warn(`[LOGIN] Failed - Wrong password: ${email}`)
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Create a token that expires in 1 day
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    )

    console.log(`[LOGIN] Success - User: ${email}, Role: ${user.role}`)
    res.json({ token, role: user.role, name: user.name })

  } catch (err) {
    console.error(`[LOGIN] Error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}