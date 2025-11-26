import { Router } from "express";
import {
  createFeesMasterController,
  deleteFeesMasterController,
  editFeesMasterController,
  getAllFeesMastersController,
  getFeesMasterController,
} from "../controllers/feesMaster.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createFeesMasterController);
router.get("/getAll", authenticateUser,  getAllFeesMastersController);
router.get("/getById/:id", authenticateUser, getFeesMasterController);
router.patch("/edit/:id", authenticateUser, editFeesMasterController);
router.delete("/delete/:id", authenticateUser, deleteFeesMasterController);

export default router;
