import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// This runs before any protected route
// It checks if the user sent a valid token
export const protect = (req: Request, res: Response, next: NextFunction) => {

  // Get token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1]

  // Block the request if no token was sent
  if (!token) {
    return res.status(401).json({ message: 'No token' })
  }

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)

    // Attach user info so controllers can use it
    ;(req as any).user = decoded

    // Move on to the next function
    next()

  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}