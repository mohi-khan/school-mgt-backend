import express from 'express'
import { upload } from '../middlewares/upload'
import { createStudentController } from '../controllers/students.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = express.Router()

router.post(
  '/create',
  upload.fields([
    { name: 'photoUrl', maxCount: 1 },
    { name: 'fatherPhotoUrl', maxCount: 1 },
    { name: 'motherPhotoUrl', maxCount: 1 },
  ]),
  authenticateUser,
  createStudentController
)

export default router
