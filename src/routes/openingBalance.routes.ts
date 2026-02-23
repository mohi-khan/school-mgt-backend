import { Router } from 'express'
import {
  createOpeningBalanceController,
  getAllOpeningBalancesController,
} from '../controllers/openingBalance.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createOpeningBalanceController)
router.get('/getAll', authenticateUser, getAllOpeningBalancesController)

export default router
