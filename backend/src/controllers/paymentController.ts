import { Request, Response } from 'express'
import webpush from 'web-push'
import Payment from '../models/Payment'
import User from '../models/User'

export const addPayment = async (req: Request, res: Response) => {
  try {
    const { amount, date, method, month, note } = req.body
    console.log(`[PAYMENT] Add attempt - Amount: ${amount}, Month: ${month}`)

    const proofImage = (req as any).file
      ? `/uploads/${(req as any).file.filename}`
      : ''

    const payment = await Payment.create({
      tenant: (req as any).user.id,
      amount, date, method, month, note, proofImage
    })

    console.log(`[PAYMENT] Added successfully - ID: ${payment._id}`)

    const tenant = await User.findById((req as any).user.id)
    const landlords = await User.find({ role: 'landlord', pushSubscription: { $ne: null } })

    for (const landlord of landlords) {
      if (landlord.pushSubscription) {
        try {
          await webpush.sendNotification(
            landlord.pushSubscription as any,
            JSON.stringify({
              title: 'New Payment Received 💰',
              body: `${tenant?.name} paid $${amount} for ${month}`
            })
          )
          console.log(`[PUSH] Notification sent to landlord: ${landlord.email}`)
        } catch {
          console.error('[PUSH] Failed to send to landlord')
        }
      }
    }

    res.status(201).json(payment)
  } catch (err) {
    console.error(`[PAYMENT] Add error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMyPayments = async (req: Request, res: Response) => {
  try {
    console.log(`[PAYMENT] Fetching payments for user: ${(req as any).user.id}`)
    const payments = await Payment.find({
      tenant: (req as any).user.id
    }).sort({ createdAt: -1 })
    console.log(`[PAYMENT] Found ${payments.length} payments`)
    res.json(payments)
  } catch (err) {
    console.error(`[PAYMENT] Get error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updatePayment = async (req: Request, res: Response) => {
  try {
    console.log(`[PAYMENT] Update attempt - ID: ${req.params.id}, Status: ${req.body.status}`)

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('tenant')

    if (req.body.status && payment) {
      const tenant = await User.findById((payment as any).tenant)
      if (tenant?.pushSubscription) {
        const msg = req.body.status === 'confirmed'
          ? { title: 'Payment Confirmed ✅', body: `Your payment of $${payment.amount} confirmed!` }
          : { title: 'Payment Flagged 🚩', body: `Your payment of $${payment.amount} was flagged!` }

        try {
          await webpush.sendNotification(tenant.pushSubscription as any, JSON.stringify(msg))
          console.log(`[PUSH] Notification sent to tenant: ${tenant.email}`)
        } catch {
          console.error('[PUSH] Failed to send to tenant')
        }
      }
    }

    console.log(`[PAYMENT] Updated successfully - ID: ${req.params.id}`)
    res.json(payment)
  } catch (err) {
    console.error(`[PAYMENT] Update error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deletePayment = async (req: Request, res: Response) => {
  try {
    console.log(`[PAYMENT] Delete attempt - ID: ${req.params.id}`)
    await Payment.findByIdAndDelete(req.params.id)
    console.log(`[PAYMENT] Deleted successfully - ID: ${req.params.id}`)
    res.json({ message: 'Payment deleted' })
  } catch (err) {
    console.error(`[PAYMENT] Delete error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    console.log('[PAYMENT] Fetching all payments (landlord)')
    const payments = await Payment.find()
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 })
    console.log(`[PAYMENT] Found ${payments.length} total payments`)
    res.json(payments)
  } catch (err) {
    console.error(`[PAYMENT] Get all error: ${err}`)
    res.status(500).json({ message: 'Server error' })
  }
}