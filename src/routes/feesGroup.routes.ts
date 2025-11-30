import { Router } from "express";
import {
  createFeesGroupController,
  deleteFeesGroupController,
  editFeesGroupController,
  getAllFeesGroupsController,
  getFeesGroupController,
} from "../controllers/feesGroup.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createFeesGroupController);
router.get("/getAll", authenticateUser,  getAllFeesGroupsController);
router.get("/getById/:id", authenticateUser, getFeesGroupController);
router.patch("/edit/:id", authenticateUser, editFeesGroupController);
router.delete("/delete/:id", authenticateUser, deleteFeesGroupController);

export default router;
