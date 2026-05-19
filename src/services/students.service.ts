import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  divisionModel,
  feesGroupModel,
  feesMasterModel,
  feesTypeModel,
  sectionsModel,
  sessionsModel,
  studentFeesModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

export type StudentDetailsType = {
  admissionNo: number
  rollNo: number
  classId?: number | null
  sectionId?: number | null

  firstName: string
  lastName: string
  gender: 'male' | 'female'

  dateOfBirth: string
  religion?: string | null

  bloodGroup?: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-' | 'A-' | 'B-' | 'AB-' | null

  height?: number | null
  weight?: number | null

  address?: string | null

  phoneNumber: string
  email: string

  admissionDate: string

  photoUrl?: string | null
  isActive?: boolean

  fatherName?: string | null
  fatherPhone: string
  fatherEmail: string
  fatherOccupation?: string | null
  fatherPhotoUrl?: string | null

  motherName?: string | null
  motherPhone: string
  motherEmail: string
  motherOccupation?: string | null
  motherPhotoUrl?: string | null

  createdAt?: string | null
  updatedAt?: string | null
}

export type CreateStudentWithFiles = {
  studentDetails: StudentDetailsType
  studentFees: { feesMasterId: number }[]
  photoUrls?: Express.Multer.File[]
}

// students.service.ts
export const createStudent = async (data: {
  studentDetails: any
  studentFees: {
    studentId: number | null
    feesMasterId: number
    amount?: number
  }[]
}) => {
  return await db.transaction(async (tx) => {
    // Validate required fields
    if (!data.studentDetails.admissionNo)
      throw new Error('admissionNo is required')

    // Insert student
    const [inserted] = await tx
      .insert(studentsModel)
      .values({
        admissionNo: data.studentDetails.admissionNo,
        rollNo: data.studentDetails.rollNo,
        classId: data.studentDetails.classId ?? null,
        divisionId: data.studentDetails.divisionId ?? null,
        sectionId: data.studentDetails.sectionId ?? null,
        sessionId: data.studentDetails.sessionId ?? null,
        firstName: data.studentDetails.firstName,
        lastName: data.studentDetails.lastName,
        gender: data.studentDetails.gender,
        dateOfBirth: data.studentDetails.dateOfBirth
          ? new Date(data.studentDetails.dateOfBirth)
          : new Date(),
        religion: data.studentDetails.religion ?? null,
        bloodGroup: data.studentDetails.bloodGroup ?? null,
        height: data.studentDetails.height ?? null,
        weight: data.studentDetails.weight ?? null,
        address: data.studentDetails.address ?? null,
        phoneNumber: data.studentDetails.phoneNumber,
        email: data.studentDetails.email,
        admissionDate: data.studentDetails.admissionDate
          ? new Date(data.studentDetails.admissionDate)
          : new Date(),
        photoUrl: data.studentDetails.photoUrl ?? null,
        isActive: data.studentDetails.isActive ?? true,
        fatherName: data.studentDetails.fatherName ?? null,
        fatherPhone: data.studentDetails.fatherPhone,
        fatherEmail: data.studentDetails.fatherEmail,
        fatherOccupation: data.studentDetails.fatherOccupation ?? null,
        fatherPhotoUrl: data.studentDetails.fatherPhotoUrl ?? null,
        motherName: data.studentDetails.motherName ?? null,
        motherPhone: data.studentDetails.motherPhone,
        motherEmail: data.studentDetails.motherEmail,
        motherOccupation: data.studentDetails.motherOccupation ?? null,
        motherPhotoUrl: data.studentDetails.motherPhotoUrl ?? null,
      })
      .$returningId()

    const studentId = inserted.studentId

    // Insert Student Fees
    if (Array.isArray(data.studentFees) && data.studentFees.length > 0) {
      const feesMasterIds = data.studentFees.map((f) => f.feesMasterId)

      // Fetch fees_master rows for mapping
      const feesMasterList = await tx
        .select({
          id: feesMasterModel.feesMasterId,
          amount: feesMasterModel.amount,
        })
        .from(feesMasterModel)
        .where(inArray(feesMasterModel.feesMasterId, feesMasterIds))

      const feesData = data.studentFees.map((f) => {
        const fm = feesMasterList.find((x) => x.id === f.feesMasterId)
        if (!fm) {
          throw new Error(`Invalid feesMasterId: ${f.feesMasterId}`)
        }

        return {
          studentId,
          feesMasterId: f.feesMasterId,
          amount: fm.amount,
          paidAmount: 0,
          remainingAmount: fm.amount,
          status: 'Unpaid' as const,
        }
      })

      await tx.insert(studentFeesModel).values(feesData)
    }

    // Fetch & return student with fees
    const student = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
      with: { studentFees: true },
    })
    return student
  })
}

// students.service.ts
export const updateStudentWithFees = async (data: {
  studentId: number
  studentDetails: any
  studentFees: { feesMasterId: number }[]
}) => {
  return await db.transaction(async (tx) => {
    const { studentId, studentDetails, studentFees } = data

    // =========================
    // CHECK STUDENT
    // =========================

    const existingStudent = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
    })

    if (!existingStudent) {
      throw new Error('Student not found')
    }

    // =========================
    // UPDATE ONLY CHANGED FIELDS
    // =========================

    const updateData: any = {}

    const assignIfChanged = (key: string, newValue: any, oldValue: any) => {
      const normalizedNew =
        newValue instanceof Date ? newValue.getTime() : newValue

      const normalizedOld =
        oldValue instanceof Date ? oldValue.getTime() : oldValue

      if (normalizedNew !== normalizedOld && newValue !== undefined) {
        updateData[key] = newValue
      }
    }

    assignIfChanged(
      'admissionNo',
      studentDetails.admissionNo,
      existingStudent.admissionNo
    )

    assignIfChanged('rollNo', studentDetails.rollNo, existingStudent.rollNo)

    assignIfChanged(
      'classId',
      studentDetails.classId ?? null,
      existingStudent.classId
    )

    assignIfChanged(
      'divisionId',
      studentDetails.divisionId ?? null,
      existingStudent.divisionId
    )

    assignIfChanged(
      'sectionId',
      studentDetails.sectionId ?? null,
      existingStudent.sectionId
    )

    assignIfChanged(
      'sessionId',
      studentDetails.sessionId ?? null,
      existingStudent.sessionId
    )

    assignIfChanged(
      'firstName',
      studentDetails.firstName,
      existingStudent.firstName
    )

    assignIfChanged(
      'lastName',
      studentDetails.lastName,
      existingStudent.lastName
    )

    assignIfChanged('gender', studentDetails.gender, existingStudent.gender)

    assignIfChanged(
      'dateOfBirth',
      studentDetails.dateOfBirth ? new Date(studentDetails.dateOfBirth) : null,
      existingStudent.dateOfBirth
    )

    assignIfChanged(
      'religion',
      studentDetails.religion ?? null,
      existingStudent.religion
    )

    assignIfChanged(
      'bloodGroup',
      studentDetails.bloodGroup ?? null,
      existingStudent.bloodGroup
    )

    assignIfChanged(
      'height',
      studentDetails.height ?? null,
      existingStudent.height
    )

    assignIfChanged(
      'weight',
      studentDetails.weight ?? null,
      existingStudent.weight
    )

    assignIfChanged(
      'address',
      studentDetails.address ?? null,
      existingStudent.address
    )

    assignIfChanged(
      'phoneNumber',
      studentDetails.phoneNumber,
      existingStudent.phoneNumber
    )

    assignIfChanged('email', studentDetails.email, existingStudent.email)

    assignIfChanged(
      'admissionDate',
      studentDetails.admissionDate
        ? new Date(studentDetails.admissionDate)
        : null,
      existingStudent.admissionDate
    )

    assignIfChanged(
      'photoUrl',
      studentDetails.photoUrl ?? existingStudent.photoUrl,
      existingStudent.photoUrl
    )

    assignIfChanged(
      'isActive',
      studentDetails.isActive ?? existingStudent.isActive,
      existingStudent.isActive
    )

    assignIfChanged(
      'fatherName',
      studentDetails.fatherName ?? null,
      existingStudent.fatherName
    )

    assignIfChanged(
      'fatherPhone',
      studentDetails.fatherPhone,
      existingStudent.fatherPhone
    )

    assignIfChanged(
      'fatherEmail',
      studentDetails.fatherEmail,
      existingStudent.fatherEmail
    )

    assignIfChanged(
      'fatherOccupation',
      studentDetails.fatherOccupation ?? null,
      existingStudent.fatherOccupation
    )

    assignIfChanged(
      'fatherPhotoUrl',
      studentDetails.fatherPhotoUrl ?? existingStudent.fatherPhotoUrl,
      existingStudent.fatherPhotoUrl
    )

    assignIfChanged(
      'motherName',
      studentDetails.motherName ?? null,
      existingStudent.motherName
    )

    assignIfChanged(
      'motherPhone',
      studentDetails.motherPhone,
      existingStudent.motherPhone
    )

    assignIfChanged(
      'motherEmail',
      studentDetails.motherEmail,
      existingStudent.motherEmail
    )

    assignIfChanged(
      'motherOccupation',
      studentDetails.motherOccupation ?? null,
      existingStudent.motherOccupation
    )

    assignIfChanged(
      'motherPhotoUrl',
      studentDetails.motherPhotoUrl ?? existingStudent.motherPhotoUrl,
      existingStudent.motherPhotoUrl
    )

    // Only update if something changed
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date()

      await tx
        .update(studentsModel)
        .set(updateData)
        .where(eq(studentsModel.studentId, studentId))
    }

    // =========================
    // HANDLE FEES SMARTLY
    // =========================

    const existingFees = await tx.query.studentFeesModel.findMany({
      where: eq(studentFeesModel.studentId, studentId),
    })

    const existingFeesMasterIds = existingFees
      .map((f) => f.feesMasterId)
      .filter((id): id is number => id !== null)

    const incomingFeesMasterIds = studentFees
      .map((f) => f.feesMasterId)
      .filter((id): id is number => id !== null)

    // Fees to add
    const feesToAdd = incomingFeesMasterIds.filter(
      (id) => !existingFeesMasterIds.includes(id)
    )

    // Fees to remove
    const feesToRemove = existingFeesMasterIds.filter(
      (id) => !incomingFeesMasterIds.includes(id)
    )

    // =========================
    // DELETE REMOVED FEES
    // =========================

    if (feesToRemove.length > 0) {
      await tx
        .delete(studentFeesModel)
        .where(
          and(
            eq(studentFeesModel.studentId, studentId),
            inArray(studentFeesModel.feesMasterId, feesToRemove)
          )
        )
    }

    // =========================
    // INSERT NEW FEES
    // =========================

    if (feesToAdd.length > 0) {
      const feesMasterList = await tx
        .select({
          id: feesMasterModel.feesMasterId,
          amount: feesMasterModel.amount,
        })
        .from(feesMasterModel)
        .where(inArray(feesMasterModel.feesMasterId, feesToAdd))

      const feesData = feesToAdd.map((feesMasterId) => {
        const fm = feesMasterList.find((x) => x.id === feesMasterId)

        if (!fm) {
          throw new Error(`Invalid feesMasterId: ${feesMasterId}`)
        }

        return {
          studentId,
          feesMasterId,
          amount: fm.amount,
          paidAmount: 0,
          remainingAmount: fm.amount,
          status: 'Unpaid' as const,
        }
      })

      await tx.insert(studentFeesModel).values(feesData)
    }

    // =========================
    // RETURN UPDATED STUDENT
    // =========================

    const updatedStudent = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
      with: {
        studentFees: true,
      },
    })

    return updatedStudent
  })
}

export async function getAllStudents(
  classId?: number | null,
  sectionId?: number | null,
  divisionId?: number | null
) {
  const conditions: any[] = []

  if (classId) conditions.push(eq(studentsModel.classId, classId))
  if (sectionId) conditions.push(eq(studentsModel.sectionId, sectionId))
  if (divisionId) conditions.push(eq(studentsModel.divisionId, divisionId))

  const baseQuery = db
    .select({
      studentId: studentsModel.studentId,
      admissionNo: studentsModel.admissionNo,
      rollNo: studentsModel.rollNo,
      classId: studentsModel.classId,
      divisionId: studentsModel.divisionId,
      sectionId: studentsModel.sectionId,
      sessionId: studentsModel.sessionId,
      firstName: studentsModel.firstName,
      lastName: studentsModel.lastName,
      gender: studentsModel.gender,
      dateOfBirth: studentsModel.dateOfBirth,
      religion: studentsModel.religion,
      bloodGroup: studentsModel.bloodGroup,
      height: studentsModel.height,
      weight: studentsModel.weight,
      address: studentsModel.address,
      phoneNumber: studentsModel.phoneNumber,
      email: studentsModel.email,
      admissionDate: studentsModel.admissionDate,
      photoUrl: studentsModel.photoUrl,
      isActive: studentsModel.isActive,
      fatherName: studentsModel.fatherName,
      fatherPhone: studentsModel.fatherPhone,
      fatherEmail: studentsModel.fatherEmail,
      fatherOccupation: studentsModel.fatherOccupation,
      fatherPhotoUrl: studentsModel.fatherPhotoUrl,
      motherName: studentsModel.motherName,
      motherPhone: studentsModel.motherPhone,
      motherEmail: studentsModel.motherEmail,
      motherOccupation: studentsModel.motherOccupation,
      motherPhotoUrl: studentsModel.motherPhotoUrl,
      createdAt: studentsModel.createdAt,
      updatedAt: studentsModel.updatedAt,
      className: classesModel.className,
      divisionName: divisionModel.divisionName,
      sectionName: sectionsModel.sectionName,
      sessionName: sessionsModel.sessionName,
      
    })
    .from(studentsModel)
    .leftJoin(classesModel, eq(studentsModel.classId, classesModel.classId))
    .leftJoin(
      divisionModel,
      eq(studentsModel.divisionId, divisionModel.divisionId)
    )
    .leftJoin(
      sectionsModel,
      eq(studentsModel.sectionId, sectionsModel.sectionId)
    )
    .leftJoin(
      sessionsModel,
      eq(studentsModel.sessionId, sessionsModel.sessionId)
    )

  // Apply WHERE only when filters exist
  const query =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery

  const students = await query

  if (students.length === 0) return []

  const studentIds = students.map((s) => s.studentId)

  const fees = await db
    .select({
      studentFeeId: studentFeesModel.studentFeesId,
      studentId: studentFeesModel.studentId,
      feesMasterId: studentFeesModel.feesMasterId,
      amount: studentFeesModel.amount,
      paidAmount: studentFeesModel.paidAmount,
      remainingAmount: studentFeesModel.remainingAmount,
      status: studentFeesModel.status,
      createdAt: studentFeesModel.createdAt,
      dueDate: feesMasterModel.dueDate,
      lastPaymentDate: studentFeesModel.updatedAt,
      // fees type fields
      feesTypeId: feesTypeModel.feesTypeId,
      feesTypeName: feesTypeModel.typeName,
    })
    .from(studentFeesModel)
    .leftJoin(
      feesMasterModel,
      eq(studentFeesModel.feesMasterId, feesMasterModel.feesMasterId)
    )
    .leftJoin(
      feesTypeModel,
      eq(feesMasterModel.feesTypeId, feesTypeModel.feesTypeId)
    )
    .where(inArray(studentFeesModel.studentId, studentIds))

  const feeMap: Record<number, any[]> = {}

  for (const f of fees) {
    if (!feeMap[f.studentId!]) feeMap[f.studentId!] = []

    feeMap[f.studentId!].push({
      studentFeeId: f.studentFeeId,
      feesTypeId: f.feesTypeId,
      amount: f.amount,
      paidAmount: f.paidAmount,
      remainingAmount: f.remainingAmount,
      dueDate: f.dueDate,
      lastPaymentDate: f.lastPaymentDate,
      status: f.status,
      createdAt: f.createdAt,
      feesTypeName: f.feesTypeName,
    })
  }

  return students.map((st) => ({
    studentDetails: st,
    studentFees: feeMap[st.studentId] || [],
  }))
}

export async function getStudentById(studentId: number) {
  // 1️⃣ Fetch single student
  const student = await db
    .select({
      studentId: studentsModel.studentId,
      admissionNo: studentsModel.admissionNo,
      rollNo: studentsModel.rollNo,
      classId: studentsModel.classId,
      divisionId: studentsModel.divisionId,
      sectionId: studentsModel.sectionId,
      sessionId: studentsModel.sessionId,
      firstName: studentsModel.firstName,
      lastName: studentsModel.lastName,
      gender: studentsModel.gender,
      dateOfBirth: studentsModel.dateOfBirth,
      religion: studentsModel.religion,
      bloodGroup: studentsModel.bloodGroup,
      height: studentsModel.height,
      weight: studentsModel.weight,
      address: studentsModel.address,
      phoneNumber: studentsModel.phoneNumber,
      email: studentsModel.email,
      admissionDate: studentsModel.admissionDate,
      photoUrl: studentsModel.photoUrl,
      isActive: studentsModel.isActive,
      fatherName: studentsModel.fatherName,
      fatherPhone: studentsModel.fatherPhone,
      fatherEmail: studentsModel.fatherEmail,
      fatherOccupation: studentsModel.fatherOccupation,
      fatherPhotoUrl: studentsModel.fatherPhotoUrl,
      motherName: studentsModel.motherName,
      motherPhone: studentsModel.motherPhone,
      motherEmail: studentsModel.motherEmail,
      motherOccupation: studentsModel.motherOccupation,
      motherPhotoUrl: studentsModel.motherPhotoUrl,
      createdAt: studentsModel.createdAt,
      updatedAt: studentsModel.updatedAt,
      className: classesModel.className,
      sectionName: sectionsModel.sectionName,
      sessionName: sessionsModel.sessionName,
    })
    .from(studentsModel)
    .leftJoin(classesModel, eq(studentsModel.classId, classesModel.classId))
    .leftJoin(
      divisionModel,
      eq(studentsModel.divisionId, divisionModel.divisionId)
    )
    .leftJoin(
      sectionsModel,
      eq(studentsModel.sectionId, sectionsModel.sectionId)
    )
    .leftJoin(
      sessionsModel,
      eq(studentsModel.sessionId, sessionsModel.sessionId)
    )
    .where(eq(studentsModel.studentId, studentId))

  if (student.length === 0) return null

  // 2️⃣ Fetch student fees
  const fees = await db
    .select({
      studentFeesId: studentFeesModel.studentFeesId,
      studentId: studentFeesModel.studentId,
      feesMasterId: studentFeesModel.feesMasterId,
      feesGroup: feesMasterModel.feesGroupId,
      feesGroupName: feesGroupModel.groupName,
      feesType: feesMasterModel.feesTypeId,
      feesTypeName: feesTypeModel.typeName,
      amount: studentFeesModel.amount,
      paidAmount: studentFeesModel.paidAmount,
      remainingAmount: studentFeesModel.remainingAmount,
      status: studentFeesModel.status,
      dueDate: feesMasterModel.dueDate,
      paymentMethod: studentPaymentsModel.method,
      paymentDate: studentPaymentsModel.paymentDate,
      paymentRemarks: studentPaymentsModel.remarks,
    })
    .from(studentFeesModel)
    .leftJoin(
      feesMasterModel,
      eq(studentFeesModel.feesMasterId, feesMasterModel.feesMasterId)
    )
    .leftJoin(
      feesGroupModel,
      eq(feesMasterModel.feesGroupId, feesGroupModel.feesGroupId)
    )
    .leftJoin(
      feesTypeModel,
      eq(feesMasterModel.feesTypeId, feesTypeModel.feesTypeId)
    )
    .leftJoin(
      studentPaymentsModel,
      eq(studentFeesModel.studentFeesId, studentPaymentsModel.studentFeesId)
    )
    .where(eq(studentFeesModel.studentId, studentId))

  return {
    studentDetails: student[0],
    studentFees: fees,
  }
}

export const deleteStudent = async (studentId: number) => {
  return await db.transaction(async (tx) => {
    if (!studentId) {
      throw new Error('studentId is required')
    }

    // Check if student exists before deletion
    const student = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
      with: { studentFees: true },
    })

    if (!student) {
      throw new Error('Student not found')
    }

    // Delete fees first (because of foreign key constraints)
    await tx
      .delete(studentFeesModel)
      .where(eq(studentFeesModel.studentId, studentId))

    // Delete student
    await tx.delete(studentsModel).where(eq(studentsModel.studentId, studentId))

    return {
      message: 'Student deleted successfully',
      deletedStudent: student,
    }
  })
}

export const activateStudent = async (
  studentId: number,
) => {
  const [activateStudent] = await db
    .update(studentsModel)
    .set({ isActive: true })
    .where(eq(studentsModel.studentId, studentId))

  if (!activateStudent) {
    throw BadRequestError('Student not found')
  }

  return activateStudent
}

export const deactivateStudent = async (
  studentId: number,
) => {
  const [activateStudent] = await db
    .update(studentsModel)
    .set({ isActive: false })
    .where(eq(studentsModel.studentId, studentId))

  if (!activateStudent) {
    throw BadRequestError('Student not found')
  }

  return activateStudent
}