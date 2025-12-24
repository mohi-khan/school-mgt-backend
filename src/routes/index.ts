import { Router } from 'express'
import authRoutes from './auth.routes'
import sectionRoutes from './sections.routes'
import classesRoutes from './classes.routes'
import feesGroupRoutes from './feesGroup.routes'
import feesTypeRoutes from './feesType.routes'
import feesMasterRoutes from './feesMaster.routes'
import sessionRoutes from './sessions.routes'
import bankAccountsRoutes from './bankAccount.routes'
import mfsRoutes from './mfs.routes'
import studentsRoutes from './students.routes'
import studentFeesRoutes from './student-fees.routes'
import studentPromotionsRoutes from './studentPromotions.routes'
import examGroupsRotes from './examGroups.routes'
import examSubjectsRoutes from './examSubjects.routes'
import examsRoutes from './exams.routes'
import examResultRoutes from './examResult.routes'
import incomeHeadRoutes from './incomeHead.routes'
import incomeRoutes from './income.routes'
import expenseHeadRoutes from './expenseHead.routes'
import expenseRoutes from './expense.routes'
import bankMfsCashRoutes from './bankMfsCash.routes'
import reportsRoutes from './reports.routes'
import dashboardRoutes from './dashboard.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/sections', sectionRoutes)
router.use('/classes', classesRoutes)
router.use('/fees-groups', feesGroupRoutes)
router.use('/fees-types', feesTypeRoutes)
router.use('/fees-master', feesMasterRoutes)
router.use('/sessions', sessionRoutes)
router.use('/bank-accounts', bankAccountsRoutes)
router.use('/mfs', mfsRoutes)
router.use('/students', studentsRoutes)
router.use('/student-fees', studentFeesRoutes)
router.use('/student-promotions', studentPromotionsRoutes)
router.use('/exam-groups', examGroupsRotes)
router.use('/exam-subjects', examSubjectsRoutes)
router.use('/exams', examsRoutes)
router.use('/exam-results', examResultRoutes)
router.use('/income-heads', incomeHeadRoutes)
router.use('/incomes', incomeRoutes)
router.use('/expense-heads', expenseHeadRoutes)
router.use('/expenses', expenseRoutes)
router.use('/bank-mfs-cash', bankMfsCashRoutes)
router.use('/reports', reportsRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
