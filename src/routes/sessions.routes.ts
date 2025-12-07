import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getAllSessionsController } from "../controllers/sessions.controller";

const router = Router();

router.get("/getAll", authenticateUser,  getAllSessionsController);

export default router;