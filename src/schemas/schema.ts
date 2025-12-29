import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
  text,
  double,
  date,
  mysqlEnum,
  time,
} from 'drizzle-orm/mysql-core'

// ========================
// Roles & Permissions
// ========================
export const roleModel = mysqlTable('roles', {
  roleId: int('role_id').primaryKey(),
  roleName: varchar('role_name', { length: 50 }).notNull(),
})

export const userModel = mysqlTable('users', {
  userId: int('user_id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('PASSWORD', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  roleId: int('role_id').references(() => roleModel.roleId, {
    onDelete: 'set null',
  }),
  isPasswordResetRequired: boolean('is_password_reset_required').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
})

export const permissionsModel = mysqlTable('permissions', {
  id: int('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
})

export const rolePermissionsModel = mysqlTable('role_permissions', {
  roleId: int('role_id').references(() => roleModel.roleId),
  permissionId: int('permission_id')
    .notNull()
    .references(() => permissionsModel.id),
})

export const userRolesModel = mysqlTable('user_roles', {
  userId: int('user_id')
    .notNull()
    .references(() => userModel.userId),
  roleId: int('role_id')
    .notNull()
    .references(() => roleModel.roleId),
})

// ========================
// Business Domain Tables
// ========================
export const sessionsModel = mysqlTable('sessions', {
  sessionId: int('session_id').primaryKey().autoincrement(),
  sessionName: varchar('session_name', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const classesModel = mysqlTable('classes', {
  classId: int('class_id').primaryKey().autoincrement(),
  className: varchar('class_name', { length: 50 }).notNull(),
  classCode: varchar('class_code', { length: 20 }).unique(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const sectionsModel = mysqlTable('sections', {
  sectionId: int('section_id').primaryKey().autoincrement(),
  sectionName: varchar('section_name', { length: 50 }).notNull(),
  sectionCode: varchar('section_code', { length: 20 }),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const classSectionsModel = mysqlTable('class_sections', {
  classSectionId: int('class_section_id').primaryKey().autoincrement(),
  classId: int('class_id').references(() => classesModel.classId, {
    onDelete: 'set null',
  }),
  sectionId: int('section_id').references(() => sectionsModel.sectionId, {
    onDelete: 'set null',
  }),
  roomNo: varchar('room_no', { length: 20 }),
  classTeacherId: int('class_teacher_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const bankAccountModel = mysqlTable('bank_account', {
  bankAccountId: int('bank_account_id').autoincrement().primaryKey(),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  accountNumber: varchar('account_number', { length: 50 }).notNull(),
  branch: varchar('branch', { length: 100 }),
  balance: double('balance').notNull(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const mfsModel = mysqlTable('mfs', {
  mfsId: int('mfs_id').primaryKey().autoincrement(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  mfsNumber: varchar('mfs_number', { length: 15 }).notNull(),
  mfsType: mysqlEnum('mfs_type', ['bkash', 'nagad', 'rocket']).notNull(),
  balance: double('balance').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const feesGroupModel = mysqlTable('fees_groups', {
  feesGroupId: int('fees_group_id').primaryKey().autoincrement(),
  groupName: varchar('group_name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const feesTypeModel = mysqlTable('fees_types', {
  feesTypeId: int('fees_type_id').primaryKey().autoincrement(),
  typeName: varchar('type_name', { length: 100 }).notNull(),
  feesCode: varchar('fees_code', { length: 50 }).unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const feesMasterModel = mysqlTable('fees_master', {
  feesMasterId: int('fees_master_id').primaryKey().autoincrement(),
  feesGroupId: int('fees_group_id').references(
    () => feesGroupModel.feesGroupId,
    {
      onDelete: 'set null',
    }
  ),
  feesTypeId: int('fees_type_id').references(() => feesTypeModel.feesTypeId, {
    onDelete: 'set null',
  }),
  dueDate: date('due_date').notNull(),
  amount: double('amount').notNull(),
  fineType: mysqlEnum('fine_type', [
    'none',
    'percentage',
    'fixed amount',
  ]).notNull(),
  percentageFineAmount: double('percentage_fine_amount'),
  fixedFineAmount: double('fixed_fine_amount'),
  perDay: boolean('per_day').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const studentsModel = mysqlTable('students', {
  studentId: int('student_id').primaryKey().autoincrement(),
  admissionNo: double('admission_no').notNull().unique(),
  rollNo: double('roll_no').notNull().unique(),
  classId: int('class_id').references(() => classesModel.classId, {
    onDelete: 'set null',
  }),
  sectionId: int('section_id').references(() => sectionsModel.sectionId, {
    onDelete: 'set null',
  }),
  sessionId: int('session_id').references(() => sessionsModel.sessionId, {
    onDelete: 'set null',
  }),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  gender: mysqlEnum('gender', ['male', 'female']).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  religion: varchar('religion', { length: 50 }),
  bloodGroup: mysqlEnum('blood_group', [
    'O+',
    'A+',
    'B+',
    'AB+',
    'O-',
    'A-',
    'B-',
    'AB-',
  ]),
  height: double('height'),
  weight: double('weight'),
  address: text('address'),
  phoneNumber: varchar('phone_number', { length: 15 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  admissionDate: date('admission_date').notNull(),
  photoUrl: varchar('photo_url', { length: 255 }),
  isActive: boolean('is_active').default(true),
  fatherName: varchar('father_name', { length: 100 }),
  fatherPhone: varchar('father_phone', { length: 15 }).notNull().unique(),
  fatherEmail: varchar('father_email', { length: 100 }).notNull().unique(),
  fatherOccupation: varchar('father_occupation', { length: 100 }),
  fatherPhotoUrl: varchar('father_photo_url', { length: 255 }),
  motherName: varchar('mother_name', { length: 100 }),
  motherPhone: varchar('mother_phone', { length: 15 }).notNull().unique(),
  motherEmail: varchar('mother_email', { length: 100 }).notNull().unique(),
  motherOccupation: varchar('mother_occupation', { length: 100 }),
  motherPhotoUrl: varchar('mother_photo_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const studentFeesModel = mysqlTable('student_fees', {
  studentFeesId: int('student_fees_id').primaryKey().autoincrement(),
  studentId: int('student_id').references(() => studentsModel.studentId, {
    onDelete: 'set null',
  }),
  feesMasterId: int('fees_master_id').references(
    () => feesMasterModel.feesMasterId,
    {
      onDelete: 'set null',
    }
  ),
  amount: double('amount').notNull(),
  paidAmount: double('paid_amount'),
  remainingAmount: double('remaining_amount'),
  status: mysqlEnum(['Paid', 'Unpaid', 'Partial']).default('Unpaid'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const studentPaymentsModel = mysqlTable('student_payments', {
  studentPaymentId: int('studnet_payment_id').primaryKey().autoincrement(),
  studentFeesId: int('student_fees_id').references(
    () => studentFeesModel.studentFeesId,
    {
      onDelete: 'set null',
    }
  ),
  studentId: int('student_id').references(() => studentsModel.studentId, {
    onDelete: 'set null',
  }),
  classId: int('class_id').references(() => classesModel.classId, {
    onDelete: 'set null',
  }),
  sectionId: int('section_id').references(() => sectionsModel.sectionId, {
    onDelete: 'set null',
  }),
  sessionId: int('session_id').references(() => sessionsModel.sessionId, {
    onDelete: 'set null',
  }),
  method: mysqlEnum('method', [
    'cash',
    'bank',
    'bkash',
    'nagad',
    'rocket',
  ]).notNull(),
  bankAccountId: int('bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    {
      onDelete: 'set null',
    }
  ),
  mfsId: int('mfs_id').references(() => mfsModel.mfsId, {
    onDelete: 'set null',
  }),
  paymentDate: date('payment_date').notNull(),
  paidAmount: double('paid_amount').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const studentPromotionModel = mysqlTable('student_promotions', {
  studentPromotionId: int('student_promotion_id').primaryKey().autoincrement(),
  studentId: int('student_id').references(() => studentsModel.studentId, {
    onDelete: 'set null',
  }),
  currentResult: mysqlEnum('current_result', ['Pass', 'Fail']),
  nextSession: mysqlEnum('next_session', ['Continue', 'Leave']),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const examGroupsModel = mysqlTable('exam_groups', {
  examGroupsId: int('exam_group_id').primaryKey().autoincrement(),
  examGroupName: varchar('exam_group_name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const examSubjectsModel = mysqlTable('exam_subjects', {
  examSubjectId: int('exam_subject_id').primaryKey().autoincrement(),
  subjectName: varchar('subject_name', { length: 255 }).notNull(),
  subjectCode: varchar('subject_code', { length: 10 }).notNull(),
  examDate: date('exam_date').notNull(),
  startTime: time('start_time').notNull(),
  duration: int('duration').notNull(),
  examMarks: int('exam_marks').notNull(),
  classId: int('class_id').references(() => classesModel.classId, {
    onDelete: 'set null',
  }),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const examsModel = mysqlTable('exams', {
  examId: int('exam_id').primaryKey().autoincrement(),
  examName: varchar('exam_name', { length: 255 }).notNull(),
  examGroupsId: int('exam_group_id').references(
    () => examGroupsModel.examGroupsId,
    {
      onDelete: 'set null',
    }
  ),
  sessionId: int('session_id').references(() => sessionsModel.sessionId, {
    onDelete: 'set null',
  }),
  classId: int('class_id').references(() => classesModel.classId, {
    onDelete: 'set null',
  }),
  examSubjectId: int('exam_subject_id').references(
    () => examSubjectsModel.examSubjectId,
    {
      onDelete: 'set null',
    }
  ),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const examResultModel = mysqlTable('exam_results', {
  examResultId: int('exam_result_id').primaryKey().autoincrement(),
  sessionId: int('session_id').references(() => sessionsModel.sessionId, {
    onDelete: 'set null',
  }),
  examId: int('exam_id').references(() => examsModel.examId, {
    onDelete: 'set null',
  }),
  studentId: int('student_id').references(() => studentsModel.studentId, {
    onDelete: 'set null',
  }),
  examSubjectId: int('exam_subject_id').references(
    () => examSubjectsModel.examSubjectId,
    {
      onDelete: 'set null',
    }
  ),
  classId: int('class_id').references(() => classesModel.classId, {
    onDelete: 'set null'
  }),
  sectionId: int('section_id').references(() => sectionsModel.sectionId, {
    onDelete: 'set null'
  }),
  gainedMarks: int('gained_marks').notNull(),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const incomeHeadModel = mysqlTable('income_head', {
  incomeHeadId: int('income_head_id').primaryKey().autoincrement(),
  incomeHead: varchar('income_head', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const incomeModel = mysqlTable('income', {
  incomeId: int('income_id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  incomeHeadId: int('income_head_id').references(
    () => incomeHeadModel.incomeHeadId,
    {
      onDelete: 'set null',
    }
  ),
  invoiceNumber: int('invoice_number').notNull(),
  date: date('date').notNull(),
  amount: double('amount').notNull(),
  description: text('description'),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const expenseHeadModel = mysqlTable('expense_head', {
  expenseHeadId: int('expense_head_id').primaryKey().autoincrement(),
  expenseHead: varchar('expense_head', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const expenseModel = mysqlTable('expense', {
  expenseId: int('expense_id').primaryKey().autoincrement(),
  expenseHeadId: int('expense_head_id').references(
    () => expenseHeadModel.expenseHeadId,
    {
      onDelete: 'set null',
    }
  ),
  name: varchar('name', { length: 255 }).notNull(),
  invoiceNumber: int('invoice_number').notNull(),
  date: date('date').notNull(),
  amount: double('amount').notNull(),
  description: text('description'),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

export const bankMFsCashModel = mysqlTable('bank_mfs_cash', {
  id: int('id').primaryKey().autoincrement(),
  fromBankAccountId: int('from_bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    {
      onDelete: 'set null',
    }
  ),
  fromMfsId: int('from_mfs_id').references(() => mfsModel.mfsId, {
    onDelete: 'set null',
  }),
  toBankAccountId: int('to_bank_account_id').references(
    () => bankAccountModel.bankAccountId,
    {
      onDelete: 'set null',
    }
  ),
  toMfsId: int('to_mfs_id').references(() => mfsModel.mfsId, {
    onDelete: 'set null',
  }),
  amount: double('amount').notNull(),
  date: date('date').notNull(),
  description: text('description'),
  createdBy: int('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedBy: int('updated_by'),
  updatedAt: timestamp('updated_at').onUpdateNow(),
})

// ========================
// Relations
// ========================
export const userRelations = relations(userModel, ({ one }) => ({
  role: one(roleModel, {
    fields: [userModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const roleRelations = relations(roleModel, ({ many }) => ({
  rolePermissions: many(rolePermissionsModel),
}))

export const rolePermissionsRelations = relations(
  rolePermissionsModel,
  ({ one }) => ({
    role: one(roleModel, {
      fields: [rolePermissionsModel.roleId],
      references: [roleModel.roleId],
    }),
    permission: one(permissionsModel, {
      fields: [rolePermissionsModel.permissionId],
      references: [permissionsModel.id],
    }),
  })
)

export const userRolesRelations = relations(userRolesModel, ({ one }) => ({
  user: one(userModel, {
    fields: [userRolesModel.userId],
    references: [userModel.userId],
  }),
  role: one(roleModel, {
    fields: [userRolesModel.roleId],
    references: [roleModel.roleId],
  }),
}))

export const classSectionRelations = relations(
  classSectionsModel,
  ({ one }) => ({
    class: one(classesModel, {
      fields: [classSectionsModel.classId],
      references: [classesModel.classId],
    }),
    section: one(sectionsModel, {
      fields: [classSectionsModel.sectionId],
      references: [sectionsModel.sectionId],
    }),
  })
)

export const feesMasterRelations = relations(feesMasterModel, ({ one }) => ({
  feesGroup: one(feesGroupModel, {
    fields: [feesMasterModel.feesGroupId],
    references: [feesGroupModel.feesGroupId],
  }),
  feesType: one(feesTypeModel, {
    fields: [feesMasterModel.feesTypeId],
    references: [feesTypeModel.feesTypeId],
  }),
}))

export const studentRelations = relations(studentsModel, ({ one, many }) => ({
  class: one(classesModel, {
    fields: [studentsModel.classId],
    references: [classesModel.classId],
  }),
  section: one(sectionsModel, {
    fields: [studentsModel.sectionId],
    references: [sectionsModel.sectionId],
  }),
  session: one(sessionsModel, {
    fields: [studentsModel.sessionId],
    references: [sessionsModel.sessionId],
  }),
  studentFees: many(studentFeesModel),
}))

export const studentFeesRelations = relations(studentFeesModel, ({ one }) => ({
  student: one(studentsModel, {
    fields: [studentFeesModel.studentId],
    references: [studentsModel.studentId],
  }),
  feesMaster: one(feesMasterModel, {
    fields: [studentFeesModel.feesMasterId],
    references: [feesMasterModel.feesMasterId],
  }),
}))

export const studentPaymentRelations = relations(
  studentPaymentsModel,
  ({ one }) => ({
    studentFees: one(studentFeesModel, {
      fields: [studentPaymentsModel.studentFeesId],
      references: [studentFeesModel.studentFeesId],
    }),
    class: one(classesModel, {
      fields: [studentPaymentsModel.studentFeesId],
      references: [classesModel.classId],
    }),
    section: one(sectionsModel, {
      fields: [studentPaymentsModel.studentFeesId],
      references: [sectionsModel.sectionId],
    }),
    session: one(sessionsModel, {
      fields: [studentPaymentsModel.studentFeesId],
      references: [sessionsModel.sessionId],
    }),
    student: one(studentsModel, {
      fields: [studentPaymentsModel.studentId],
      references: [studentsModel.studentId],
    }),
    bankAccount: one(bankAccountModel, {
      fields: [studentPaymentsModel.bankAccountId],
      references: [bankAccountModel.bankAccountId],
    }),
    mfs: one(mfsModel, {
      fields: [studentPaymentsModel.mfsId],
      references: [mfsModel.mfsId],
    }),
  })
)

export const studentPromotionRelations = relations(
  studentPromotionModel,
  ({ one }) => ({
    student: one(studentsModel, {
      fields: [studentPromotionModel.studentId],
      references: [studentsModel.studentId],
    }),
  })
)

export const examSubjectRelations = relations(examSubjectsModel, ({ one }) => ({
  class: one(classesModel, {
    fields: [examSubjectsModel.classId],
    references: [classesModel.classId],
  }),
}))

export const examRelations = relations(examsModel, ({ one }) => ({
  examGroups: one(examGroupsModel, {
    fields: [examsModel.examGroupsId],
    references: [examGroupsModel.examGroupsId],
  }),
  session: one(sessionsModel, {
    fields: [examsModel.sessionId],
    references: [sessionsModel.sessionId],
  }),
  class: one(classesModel, {
    fields: [examsModel.classId],
    references: [classesModel.classId],
  }),
  examSubject: one(examSubjectsModel, {
    fields: [examsModel.examSubjectId],
    references: [examSubjectsModel.examSubjectId],
  }),
}))

export const examResultRelations = relations(examResultModel, ({ one }) => ({
  session: one(sessionsModel, {
    fields: [examResultModel.sessionId],
    references: [sessionsModel.sessionId],
  }),
  exam: one(examsModel, {
    fields: [examResultModel.examId],
    references: [examsModel.examId],
  }),
  student: one(studentsModel, {
    fields: [examResultModel.studentId],
    references: [studentsModel.studentId],
  }),
  examSubject: one(examSubjectsModel, {
    fields: [examResultModel.examSubjectId],
    references: [examSubjectsModel.examSubjectId],
  }),
}))

export const incomeRelations = relations(incomeModel, ({ one }) => ({
  incomeHead: one(incomeHeadModel, {
    fields: [incomeModel.incomeHeadId],
    references: [incomeHeadModel.incomeHeadId],
  }),
}))

export const expenseRelations = relations(expenseModel, ({ one }) => ({
  expenseHead: one(expenseHeadModel, {
    fields: [expenseModel.expenseHeadId],
    references: [expenseHeadModel.expenseHeadId],
  }),
}))

export const bankToBankConversionRelations = relations(
  bankMFsCashModel,
  ({ one }) => ({
    fromBankAccount: one(bankAccountModel, {
      fields: [bankMFsCashModel.fromBankAccountId],
      references: [bankAccountModel.bankAccountId],
    }),
    toBankAccount: one(bankAccountModel, {
      fields: [bankMFsCashModel.toBankAccountId],
      references: [bankAccountModel.bankAccountId],
    }),
  })
)

export type User = typeof userModel.$inferSelect
export type NewUser = typeof userModel.$inferInsert
export type Role = typeof roleModel.$inferSelect
export type NewRole = typeof roleModel.$inferInsert
export type Permission = typeof permissionsModel.$inferSelect
export type NewPermission = typeof permissionsModel.$inferInsert
export type UserRole = typeof userRolesModel.$inferSelect
export type NewUserRole = typeof userRolesModel.$inferInsert
export type RolePermission = typeof rolePermissionsModel.$inferSelect
export type NewRolePermission = typeof rolePermissionsModel.$inferInsert
export type Classes = typeof classesModel.$inferSelect
export type NewClasses = typeof classesModel.$inferInsert
export type Section = typeof sectionsModel.$inferSelect
export type NewSection = typeof sectionsModel.$inferInsert
export type Session = typeof sessionsModel.$inferSelect
export type NewSession = typeof sessionsModel.$inferInsert
export type BankAccount = typeof bankAccountModel.$inferInsert
export type NewBankAccount = typeof bankAccountModel.$inferInsert
export type Mfs = typeof mfsModel.$inferInsert
export type NewMfs = typeof mfsModel.$inferInsert
export type ClassSection = typeof classSectionsModel.$inferSelect
export type NewClassSection = typeof classSectionsModel.$inferInsert
export type FeesGroup = typeof feesGroupModel.$inferSelect
export type NewFeesGroup = typeof feesGroupModel.$inferInsert
export type FeesType = typeof feesTypeModel.$inferSelect
export type NewFeesType = typeof feesTypeModel.$inferInsert
export type FeesMaster = typeof feesMasterModel.$inferSelect
export type NewFeesMaster = typeof feesMasterModel.$inferInsert
export type Students = typeof studentsModel.$inferSelect
export type NewStudents = typeof studentsModel.$inferInsert
export type StudentFees = typeof studentFeesModel.$inferSelect
export type NewStudentFees = typeof studentFeesModel.$inferInsert
export type StudentPayments = typeof studentPaymentsModel.$inferInsert
export type NewStudentPayments = typeof studentPaymentsModel.$inferInsert
export type ExamGroup = typeof examGroupsModel.$inferInsert
export type NewExamGroup = typeof examGroupsModel.$inferInsert
export type ExamSubjects = typeof examSubjectsModel.$inferInsert
export type NewExamSubjects = typeof examSubjectsModel.$inferInsert
export type Exam = typeof examsModel.$inferInsert
export type NewExam = typeof examsModel.$inferInsert
export type ExamResult = typeof examResultModel.$inferInsert
export type NewExamResult = typeof examResultModel.$inferInsert
export type NewIncomeHead = typeof incomeHeadModel.$inferInsert
export type IncomeHead = typeof incomeHeadModel.$inferInsert
export type Income = typeof incomeModel.$inferInsert
export type NewIncome = typeof incomeModel.$inferInsert
export type ExpenseHead = typeof expenseHeadModel.$inferInsert
export type NewExpenseHead = typeof expenseHeadModel.$inferInsert
export type Expense = typeof expenseModel.$inferInsert
export type NewExpense = typeof expenseModel.$inferInsert
export type BankMfsCash = typeof bankMFsCashModel.$inferInsert
export type NewBankMfsCash =
  typeof bankMFsCashModel.$inferInsert
