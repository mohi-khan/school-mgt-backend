import { Router } from 'express'
import {
  createDivisionController,
  deleteDivisionController,
  editDivisionController,
  getAllDivisionsController,
  getDivisionController,
} from '../controllers/division.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createDivisionController)
router.get('/getAll', authenticateUser, getAllDivisionsController)
router.get('/getById/:id', authenticateUser, getDivisionController)
router.patch('/edit/:id', authenticateUser, editDivisionController)
router.delete('/delete/:id', authenticateUser, deleteDivisionController)

export default router
