import { Router } from "express";
import {
  createFeesTypeController,
  deleteFeesTypeController,
  editFeesTypeController,
  getAllFeesTypesController,
  getFeesTypeController,
} from "../controllers/feesType.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createFeesTypeController);
router.get("/getAll", authenticateUser,  getAllFeesTypesController);
router.get("/getById/:id", authenticateUser, getFeesTypeController);
router.patch("/edit/:id", authenticateUser, editFeesTypeController);
router.delete("/delete/:id", authenticateUser, deleteFeesTypeController);

export default router;
