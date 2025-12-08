import { Router } from "express";
import {
  createExamsGroupController,
  deleteExamsGroupController,
  editExamsGroupController,
  getAllExamsGroupsController,
  getExamsGroupController,
} from "../controllers/examsGroup.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExamsGroupController);
router.get("/getAll", authenticateUser,  getAllExamsGroupsController);
router.get("/getById/:id", authenticateUser, getExamsGroupController);
router.patch("/edit/:id", authenticateUser, editExamsGroupController);
router.delete("/delete/:id", authenticateUser, deleteExamsGroupController);

export default router;
