import express from 'express'
import { upload } from '../middlewares/upload'
import { createStudentController, getAllStudentsController, getStudentByIdController } from '../controllers/students.controller'
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
);
router.get("/getAll", authenticateUser,  getAllStudentsController);
router.get("/getById/:id", authenticateUser, getStudentByIdController);

export default router
