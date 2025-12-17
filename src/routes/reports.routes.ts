import { Router } from 'express'
import {
  expenseReportController,
  incomeReportController,
  studentPaymentReportController,
} from '../controllers/reports.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.get('/payment-report', authenticateUser, studentPaymentReportController)
router.get('/income-report', authenticateUser, incomeReportController)
router.get('/expense-report', authenticateUser, expenseReportController)

export default router
