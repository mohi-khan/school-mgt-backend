import { Router } from "express";
import {
  createExamGroupController,
  deleteExamGroupController,
  editExamGroupController,
  getAllExamGroupsController,
  getExamGroupController,
} from "../controllers/examGroups.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExamGroupController);
router.get("/getAll", authenticateUser,  getAllExamGroupsController);
router.get("/getById/:id", authenticateUser, getExamGroupController);
router.patch("/edit/:id", authenticateUser, editExamGroupController);
router.delete("/delete/:id", authenticateUser, deleteExamGroupController);

export default router;
