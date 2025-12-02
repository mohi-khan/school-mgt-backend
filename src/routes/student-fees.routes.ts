import express from 'express'
import { authenticateUser } from '../middlewares/auth.middleware'
import { collectFeesController } from '../controllers/student-fees.controller';

const router = express.Router()

router.patch('/collect-fees', authenticateUser, collectFeesController);

export default router
