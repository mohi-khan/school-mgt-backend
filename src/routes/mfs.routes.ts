import { Router } from "express";
import {
  createMfsController,
  deleteMfsController,
  editMfsController,
  getAllMfssController,
  getMfsController,
} from "../controllers/mfs.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createMfsController);
router.get("/getAll", authenticateUser,  getAllMfssController);
router.get("/getById/:id", authenticateUser, getMfsController);
router.patch("/edit/:id", authenticateUser, editMfsController);
router.delete("/delete/:id", authenticateUser, deleteMfsController);

export default router;
