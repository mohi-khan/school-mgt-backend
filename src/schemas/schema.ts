import { avg, relations, sql } from 'drizzle-orm'
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
export const classesModel = mysqlTable("classes", {
  classId: int("class_id").primaryKey().autoincrement(),
  className: varchar("class_name", { length: 50 }).notNull(),
  classCode: varchar("class_code", { length: 20 }).unique(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const sectionsModel = mysqlTable("sections", {
  sectionId: int("section_id").primaryKey().autoincrement(),
  sectionName: varchar("section_name", { length: 50 }).notNull(),
  sectionCode: varchar("section_code", { length: 20 }),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const classSectionsModel = mysqlTable("class_sections", {
  classSectionId: int("class_section_id").primaryKey().autoincrement(),
  classId: int("class_id").references(() => classesModel.classId, {
    onDelete: 'set null',
  }),
  sectionId: int("section_id").references(() => sectionsModel.sectionId, {
    onDelete: 'set null',
  }),
  roomNo: varchar("room_no", { length: 20 }),
  classTeacherId: int("class_teacher_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});


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

export const classSectionRelations = relations(classSectionsModel, ({ one }) => ( {
  class: one(classesModel, {
    fields: [classSectionsModel.classId],
    references: [classesModel.classId],
  }),
  section: one(sectionsModel, {
    fields: [classSectionsModel.sectionId],
    references: [sectionsModel.sectionId],
  }),
}))

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
export type ClassSection = typeof classSectionsModel.$inferSelect
export type NewClassSection = typeof classSectionsModel.$inferInsert