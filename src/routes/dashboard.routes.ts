import express from 'express'
import { authenticateUser } from '../middlewares/auth.middleware'
import { currentMonthPaymentSummaryController, getCurrentYearMonthlyExpenseController, getCurrentYearMonthlyIncomeController } from '../controllers/dashboard.controller'

const router = express.Router()

router.get('/payment-summary', authenticateUser, currentMonthPaymentSummaryController)
router.get('/income-summary', authenticateUser, getCurrentYearMonthlyIncomeController)
router.get('/expense-summary', authenticateUser, getCurrentYearMonthlyExpenseController)

export default router
