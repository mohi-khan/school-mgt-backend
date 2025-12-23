import { Router } from 'express'
import {
  createBankMfsCashController,
  deleteBankMfsCashController,
  editBankMfsCashController,
  getAllBankMfsCashController,
  getBankMfsCashController,
} from '../controllers/bankMfsCash.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createBankMfsCashController)
router.get('/getAll', authenticateUser, getAllBankMfsCashController)
router.get('/getById/:id', authenticateUser, getBankMfsCashController)
router.patch('/edit/:id', authenticateUser, editBankMfsCashController)
router.delete(
  '/delete/:id',
  authenticateUser,
  deleteBankMfsCashController
)

export default router
