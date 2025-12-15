import { Router } from 'express'
import { studentPaymentReportController } from '../controllers/reports.controller'

const router = Router()

router.get('/payment-report', studentPaymentReportController)

export default router
