import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getAllSectionssController } from "../controllers/sections.controller";

const router = Router();

router.get("/getAll", authenticateUser,  getAllSectionssController);

export default router;