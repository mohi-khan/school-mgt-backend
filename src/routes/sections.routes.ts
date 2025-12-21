import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getSectionsByClassIdController } from "../controllers/sections.controller";

const router = Router();

router.get("/getAll", authenticateUser,  getSectionsByClassIdController);

export default router;