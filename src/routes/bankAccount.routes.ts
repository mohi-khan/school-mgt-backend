import { Router } from 'express'
import {
  createBankAccountController,
  deleteBankAccountController,
  editBankAccountController,
  getAllBankAccountsController,
  getBankAccountController,
} from '../controllers/bankAccount.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createBankAccountController)
router.get('/getAll', authenticateUser, getAllBankAccountsController)
router.get('/getById/:id', authenticateUser, getBankAccountController)
router.patch('/edit/:id', authenticateUser, editBankAccountController)
router.delete('/delete/:id', authenticateUser, deleteBankAccountController)

export default router
