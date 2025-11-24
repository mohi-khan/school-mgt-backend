import { Router } from "express";
import {
  createClassesController,
  deleteClassesController,
  editClassesController,
  getAllClassessController,
  getClassesController,
} from "../controllers/classes.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createClassesController);
router.get("/getAll", authenticateUser,  getAllClassessController);
router.get("/getById/:id", authenticateUser, getClassesController);
router.patch("/edit/:id", authenticateUser, editClassesController);
router.delete("/delete/:id", authenticateUser, deleteClassesController);

export default router;
