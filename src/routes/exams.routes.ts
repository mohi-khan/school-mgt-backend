import { Router } from "express";
import {
  createExamController,
  deleteExamController,
  editExamController,
  getAllExamsController,
  getExamController,
} from "../controllers/exams.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExamController);
router.get("/getAll", authenticateUser,  getAllExamsController);
router.get("/getById/:id", authenticateUser, getExamController);
router.patch("/edit/:id", authenticateUser, editExamController);
router.delete("/delete/:id", authenticateUser, deleteExamController);

export default router;
