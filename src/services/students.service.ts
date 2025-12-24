import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  feesGroupModel,
  feesMasterModel,
  feesTypeModel,
  sectionsModel,
  sessionsModel,
  studentFeesModel,
  studentsModel,
} from '../schemas'

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
  studentFees: { studentId: number | null; feesMasterId: number }[]
}) => {
  return await db.transaction(async (tx) => {
    // Validate required fields
    if (!data.studentDetails.admissionNo) {
      throw new Error('admissionNo is required')
    }
    if (!data.studentDetails.rollNo) {
      throw new Error('rollNo is required')
    }

    // Insert student with explicit field mapping
    const [inserted] = await tx
      .insert(studentsModel)
      .values({
        admissionNo: data.studentDetails.admissionNo,
        rollNo: data.studentDetails.rollNo,
        classId: data.studentDetails.classId ?? null,
        sectionId: data.studentDetails.sectionId ?? null,
        sessionId: data.studentDetails.sessionId ?? null,
        firstName: data.studentDetails.firstName,
        lastName: data.studentDetails.lastName,
        gender: data.studentDetails.gender,
        dateOfBirth: data.studentDetails.dateOfBirth
          ? new Date(data.studentDetails.dateOfBirth)
          : new Date(), // fallback to current date if not provided
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

    // Fetch & return complete student with fees
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

    // Ensure student exists
    const existingStudent = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
    })

    if (!existingStudent) {
      throw new Error('Student not found')
    }

    // Update student table
    await tx
      .update(studentsModel)
      .set({
        admissionNo: studentDetails.admissionNo,
        rollNo: studentDetails.rollNo,
        classId: studentDetails.classId ?? null,
        sectionId: studentDetails.sectionId ?? null,
        sessionId: studentDetails.sessionId ?? null,
        firstName: studentDetails.firstName,
        lastName: studentDetails.lastName,
        gender: studentDetails.gender,
        dateOfBirth: studentDetails.dateOfBirth
          ? new Date(studentDetails.dateOfBirth)
          : undefined,
        religion: studentDetails.religion ?? null,
        bloodGroup: studentDetails.bloodGroup ?? null,
        height: studentDetails.height ?? null,
        weight: studentDetails.weight ?? null,
        address: studentDetails.address ?? null,
        phoneNumber: studentDetails.phoneNumber,
        email: studentDetails.email,
        admissionDate: studentDetails.admissionDate
          ? new Date(studentDetails.admissionDate)
          : undefined,
        photoUrl: studentDetails.photoUrl ?? existingStudent.photoUrl,
        isActive: studentDetails.isActive ?? existingStudent.isActive,
        fatherName: studentDetails.fatherName ?? null,
        fatherPhone: studentDetails.fatherPhone,
        fatherEmail: studentDetails.fatherEmail,
        fatherOccupation: studentDetails.fatherOccupation ?? null,
        fatherPhotoUrl:
          studentDetails.fatherPhotoUrl ?? existingStudent.fatherPhotoUrl,
        motherName: studentDetails.motherName ?? null,
        motherPhone: studentDetails.motherPhone,
        motherEmail: studentDetails.motherEmail,
        motherOccupation: studentDetails.motherOccupation ?? null,
        motherPhotoUrl:
          studentDetails.motherPhotoUrl ?? existingStudent.motherPhotoUrl,
        updatedAt: new Date(),
      })
      .where(eq(studentsModel.studentId, studentId))

    // 🔥 Reset fees (simple & safe approach)
    await tx
      .delete(studentFeesModel)
      .where(eq(studentFeesModel.studentId, studentId))

    if (studentFees.length > 0) {
      const feesMasterIds = studentFees.map((f) => f.feesMasterId)

      const feesMasterList = await tx
        .select({
          id: feesMasterModel.feesMasterId,
          amount: feesMasterModel.amount,
        })
        .from(feesMasterModel)
        .where(inArray(feesMasterModel.feesMasterId, feesMasterIds))

      const feesData = studentFees.map((f) => {
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

    // Return updated student
    const updatedStudent = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
      with: { studentFees: true },
    })

    return updatedStudent
  })
}

export async function getAllStudents(
  classId?: number | null,
  sectionId?: number | null
) {
  const conditions: any[] = []

  if (classId) conditions.push(eq(studentsModel.classId, classId))
  if (sectionId) conditions.push(eq(studentsModel.sectionId, sectionId))

  const baseQuery = db
    .select({
      studentId: studentsModel.studentId,
      admissionNo: studentsModel.admissionNo,
      rollNo: studentsModel.rollNo,
      classId: studentsModel.classId,
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
    .select()
    .from(studentFeesModel)
    .where(inArray(studentFeesModel.studentId, studentIds))

  const feeMap: Record<number, any[]> = {}
  for (const f of fees) {
    if (!feeMap[f.studentId!]) feeMap[f.studentId!] = []
    feeMap[f.studentId!].push(f)
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
