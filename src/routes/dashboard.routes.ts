import express from 'express'
import { authenticateUser } from '../middlewares/auth.middleware'
import { currentMonthPaymentSummaryController } from '../controllers/dashboard.controller'

const router = express.Router()

router.get('/payment-summary', authenticateUser, currentMonthPaymentSummaryController)

export default router
