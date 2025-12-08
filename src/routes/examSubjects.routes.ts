import { Router } from "express";
import {
  createExamSubjectsController,
  deleteExamSubjectsController,
  editExamSubjectsController,
  getAllExamSubjectssController,
  getExamSubjectsController,
} from "../controllers/examSubjects.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExamSubjectsController);
router.get("/getAll", authenticateUser,  getAllExamSubjectssController);
router.get("/getById/:id", authenticateUser, getExamSubjectsController);
router.patch("/edit/:id", authenticateUser, editExamSubjectsController);
router.delete("/delete/:id", authenticateUser, deleteExamSubjectsController);

export default router;
