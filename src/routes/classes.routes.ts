import { Router } from "express";
import {
  createClassesController,
  editClassesController,
  getAllClassessController,
  getClassesController,
} from "../controllers/classes.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createClassesController);
router.get("/getAll", authenticateUser,  getAllClassessController);
router.get("/getById/:id", authenticateUser, getClassesController);
router.put("/edit/:id", authenticateUser, editClassesController);

export default router;
