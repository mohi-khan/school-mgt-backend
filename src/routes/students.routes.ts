import express from 'express'
import { upload } from '../middlewares/upload'
import { createStudentController, deleteStudentController, getAllStudentsController, getStudentByIdController, updateStudentController } from '../controllers/students.controller'
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
router.patch(
  '/edit/:id',
  upload.fields([
    { name: 'photoUrl', maxCount: 1 },
    { name: 'fatherPhotoUrl', maxCount: 1 },
    { name: 'motherPhotoUrl', maxCount: 1 },
  ]),
  authenticateUser,
  updateStudentController
)

router.get("/getAll", authenticateUser,  getAllStudentsController);
router.get("/getById/:id", authenticateUser, getStudentByIdController);
router.delete("/delete/:id", authenticateUser, deleteStudentController);

export default router
