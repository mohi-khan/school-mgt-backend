import { Router } from "express";
import {
  createIncomeController,
  deleteIncomeController,
  editIncomeController,
  getAllIncomesController,
  getIncomeController,
} from "../controllers/income.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createIncomeController);
router.get("/getAll", authenticateUser,  getAllIncomesController);
router.get("/getById/:id", authenticateUser, getIncomeController);
router.patch("/edit/:id", authenticateUser, editIncomeController);
router.delete("/delete/:id", authenticateUser, deleteIncomeController);

export default router;
