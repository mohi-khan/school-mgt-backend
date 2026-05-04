import { Router } from 'express'
import { promoteStudentsController } from '../controllers/studentPromotions.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.patch('/promote', authenticateUser, promoteStudentsController)

export default router
