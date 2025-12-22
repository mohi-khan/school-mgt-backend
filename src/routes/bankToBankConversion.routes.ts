import { Router } from 'express'
import {
  createBankToBankConversionController,
  deleteBankToBankConversionController,
  editBankToBankConversionController,
  getAllBankToBankConversionsController,
  getBankToBankConversionController,
} from '../controllers/bankToBankConversion.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createBankToBankConversionController)
router.get('/getAll', authenticateUser, getAllBankToBankConversionsController)
router.get('/getById/:id', authenticateUser, getBankToBankConversionController)
router.patch('/edit/:id', authenticateUser, editBankToBankConversionController)
router.delete(
  '/delete/:id',
  authenticateUser,
  deleteBankToBankConversionController
)

export default router
