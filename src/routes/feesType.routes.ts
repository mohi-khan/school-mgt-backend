import { Router } from "express";
import {
  createFeesTypeController,
  editFeesTypeController,
  getAllFeesTypesController,
  getFeesTypeController,
} from "../controllers/feesType.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createFeesTypeController);
router.get("/getAll", authenticateUser,  getAllFeesTypesController);
router.get("/getById/:id", authenticateUser, getFeesTypeController);
router.put("/edit/:id", authenticateUser, editFeesTypeController);

export default router;
