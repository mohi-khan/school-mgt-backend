import { Router } from 'express'
import {
  transactionReportController,
  expenseReportController,
  incomeReportController,
  studentBankPaymentReportController,
  studentCashPaymentReportController,
  studentMfsPaymentReportController,
  studentPaymentReportController,
} from '../controllers/reports.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.get('/payment-report', authenticateUser, studentPaymentReportController)
router.get('/bank-payment-report', authenticateUser, studentBankPaymentReportController)
router.get('/mfs-payment-report', authenticateUser, studentMfsPaymentReportController)
router.get('/cash-payment-report', authenticateUser, studentCashPaymentReportController)
router.get('/income-report', authenticateUser, incomeReportController)
router.get('/expense-report', authenticateUser, expenseReportController)
router.get('/transaction-report', authenticateUser, transactionReportController)

export default router
