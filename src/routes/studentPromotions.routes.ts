import { Router } from 'express'
import { promoteStudentsController } from '../controllers/studentPromotions.controller'

const router = Router()

router.patch('/promote', promoteStudentsController)

export default router
