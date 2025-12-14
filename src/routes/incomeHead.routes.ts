import { Router } from "express";
import {
  createIncomeHeadController,
  deleteIncomeHeadController,
  editIncomeHeadController,
  getAllIncomeHeadsController,
  getIncomeHeadController,
} from "../controllers/incomeHead.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createIncomeHeadController);
router.get("/getAll", authenticateUser,  getAllIncomeHeadsController);
router.get("/getById/:id", authenticateUser, getIncomeHeadController);
router.patch("/edit/:id", authenticateUser, editIncomeHeadController);
router.delete("/delete/:id", authenticateUser, deleteIncomeHeadController);

export default router;
