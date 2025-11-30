import { eq, inArray } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  sectionsModel,
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
      const feesData = data.studentFees.map((f) => ({
        studentId,
        feesMasterId: f.feesMasterId,
      }))

      await tx.insert(studentFeesModel).values(feesData)
    }

    // Fetch full student record with fees
    const student = await tx.query.studentsModel.findFirst({
      where: eq(studentsModel.studentId, studentId),
      with: { studentFees: true },
    })

    return student
  })
}

export async function getAllStudents() {
  // 1️⃣ Fetch student + class + section info
  const students = await db
    .select({
      studentId: studentsModel.studentId,
      admissionNo: studentsModel.admissionNo,
      rollNo: studentsModel.rollNo,
      classId: studentsModel.classId,
      sectionId: studentsModel.sectionId,
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
    })
    .from(studentsModel)
    .leftJoin(classesModel, eq(studentsModel.classId, classesModel.classId))
    .leftJoin(
      sectionsModel,
      eq(studentsModel.sectionId, sectionsModel.sectionId)
    )

  if (students.length === 0) return []

  const studentIds = students.map((s) => s.studentId)

  // 2️⃣ Fetch all student fees
  const fees = await db
    .select()
    .from(studentFeesModel)
    .where(inArray(studentFeesModel.studentId, studentIds))

  // 3️⃣ Group fees by studentId
  const feeMap: Record<number, any[]> = {}
  for (const f of fees) {
    if (!feeMap[f.studentId!]) feeMap[f.studentId!] = []
    feeMap[f.studentId!].push(f)
  }

  // 4️⃣ Merge students + fees
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
    })
    .from(studentsModel)
    .leftJoin(classesModel, eq(studentsModel.classId, classesModel.classId))
    .leftJoin(
      sectionsModel,
      eq(studentsModel.sectionId, sectionsModel.sectionId)
    )
    .where(eq(studentsModel.studentId, studentId))

  if (student.length === 0) return null

  // 2️⃣ Fetch student fees
  const fees = await db
    .select()
    .from(studentFeesModel)
    .where(eq(studentFeesModel.studentId, studentId))

  return {
    studentDetails: student[0],
    studentFees: fees,
  }
}
