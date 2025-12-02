import { Router } from "express";
import authRoutes from "./auth.routes";
import sectionRoutes from "./sections.routes"
import ClassesRoutes from "./classes.routes";
import feesGroupRoutes from "./feesGroup.routes";
import feesTypeRoutes from "./feesType.routes";
import feesMasterRoutes from "./feesMaster.routes";
import studentsRoutes from "./students.routes";
import studentFeesRoutes from "./student-fees.routes";

const router=Router()

router.use('/auth',authRoutes);
router.use('/sections', sectionRoutes);
router.use('/classes', ClassesRoutes);
router.use('/fees-groups', feesGroupRoutes);
router.use('/fees-types', feesTypeRoutes);
router.use('/fees-master', feesMasterRoutes);
router.use('/students', studentsRoutes);
router.use('/student-fees', studentFeesRoutes);

export default router;