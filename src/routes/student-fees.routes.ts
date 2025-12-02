import express from 'express'
import { authenticateUser } from '../middlewares/auth.middleware'
import { collectFeesController, getStudentFeesByIdController } from '../controllers/student-fees.controller';

const router = express.Router()

router.get('/get-fees/:studentId', authenticateUser, getStudentFeesByIdController);
router.patch('/collect-fees', authenticateUser, collectFeesController);

export default router
