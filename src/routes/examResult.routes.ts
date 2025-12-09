import { Router } from "express";
import {
  createExamResultController,
  deleteExamResultController,
  editExamResultController,
  getAllExamResultsController,
  getExamResultController,
} from "../controllers/examResult.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExamResultController);
router.get("/getAll", authenticateUser,  getAllExamResultsController);
router.get("/getById/:id", authenticateUser, getExamResultController);
router.patch("/edit/:id", authenticateUser, editExamResultController);
router.delete("/delete/:id", authenticateUser, deleteExamResultController);

export default router;
