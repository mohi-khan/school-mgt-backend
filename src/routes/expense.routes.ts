import { Router } from "express";
import {
  createExpenseController,
  deleteExpenseController,
  editExpenseController,
  getAllExpensesController,
  getExpenseController,
} from "../controllers/expense.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExpenseController);
router.get("/getAll", authenticateUser,  getAllExpensesController);
router.get("/getById/:id", authenticateUser, getExpenseController);
router.patch("/edit/:id", authenticateUser, editExpenseController);
router.delete("/delete/:id", authenticateUser, deleteExpenseController);

export default router;
