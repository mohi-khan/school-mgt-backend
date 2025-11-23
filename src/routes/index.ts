import { Router } from "express";
import authRoutes from "./auth.routes";
import sectionRoutes from "./sections.routes"
import ClassesRoutes from "./classes.routes";

const router=Router()

router.use('/auth',authRoutes)
router.use('/sections', sectionRoutes)
router.use('/classes', ClassesRoutes)

export default router;