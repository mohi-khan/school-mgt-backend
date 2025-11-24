import { Router } from "express";
import {
  createFeesGroupController,
  editFeesGroupController,
  getAllFeesGroupsController,
  getFeesGroupController,
} from "../controllers/feesGroup.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticateUser,  createFeesGroupController);
router.get("/getAll", authenticateUser,  getAllFeesGroupsController);
router.get("/getById/:id", authenticateUser, getFeesGroupController);
router.put("/edit/:id", authenticateUser, editFeesGroupController);

export default router;
