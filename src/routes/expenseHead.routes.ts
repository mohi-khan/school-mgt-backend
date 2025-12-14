import { Router } from "express";
import {
  createExpenseHeadController,
  deleteExpenseHeadController,
  editExpenseHeadController,
  getAllExpenseHeadsController,
  getExpenseHeadController,
} from "../controllers/expenseHead.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createExpenseHeadController);
router.get("/getAll", authenticateUser,  getAllExpenseHeadsController);
router.get("/getById/:id", authenticateUser, getExpenseHeadController);
router.patch("/edit/:id", authenticateUser, editExpenseHeadController);
router.delete("/delete/:id", authenticateUser, deleteExpenseHeadController);

export default router;
