import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  addPayment,
  getMyPayments,
  updatePayment,
  deletePayment,
  getAllPayments
} from '../controllers/paymentController'
import { protect } from '../middleware/auth'

const router = express.Router()

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage })

router.post('/', protect, upload.single('proofImage'), addPayment)
router.get('/my', protect, getMyPayments)
router.get('/all', protect, getAllPayments)
router.put('/:id', protect, updatePayment)
router.delete('/:id', protect, deletePayment)

export default router