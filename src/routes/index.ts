import { Router } from "express";
import authRoutes from "./auth.routes";
import sectionRoutes from "./sections.routes"
import ClassesRoutes from "./classes.routes";
import feesGroupRoutes from "./feesGroup.routes";
import feesTypeRoutes from "./feesType.routes";
import feesMasterRoutes from "./feesMaster.routes";
import sessionRoutes from "./sessions.routes"
import studentsRoutes from "./students.routes";
import studentFeesRoutes from "./student-fees.routes";
import studentPromotionsRoutes from "./studentPromotions.routes"
import examsGroupRotes from "./examsGroup.routes"

const router=Router()

router.use('/auth', authRoutes);
router.use('/sections', sectionRoutes);
router.use('/classes', ClassesRoutes);
router.use('/fees-groups', feesGroupRoutes);
router.use('/fees-types', feesTypeRoutes);
router.use('/fees-master', feesMasterRoutes);
router.use('/sessions', sessionRoutes);
router.use('/students', studentsRoutes);
router.use('/student-fees', studentFeesRoutes);
router.use('/student-promotions', studentPromotionsRoutes);
router.use('/exams-groups', examsGroupRotes);

export default router;