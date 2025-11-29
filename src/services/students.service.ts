import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { studentFeesModel, studentsModel } from '../schemas'

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

export const createStudent = async (data: {
  studentDetails: any
  studentFees: { studentId: number | null; feesMasterId: number }[]
}) => {
  return await db.transaction(async (tx) => {
    // Insert student
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
        dateOfBirth: new Date(data.studentDetails.dateOfBirth),
        religion: data.studentDetails.religion ?? null,
        bloodGroup: data.studentDetails.bloodGroup ?? null,
        height: data.studentDetails.height ?? null,
        weight: data.studentDetails.weight ?? null,
        address: data.studentDetails.address ?? null,
        phoneNumber: data.studentDetails.phoneNumber,
        email: data.studentDetails.email,
        admissionDate: new Date(data.studentDetails.admissionDate),
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
        createdAt: data.studentDetails.createdAt
          ? new Date(data.studentDetails.createdAt)
          : null,
        updatedAt: data.studentDetails.updatedAt
          ? new Date(data.studentDetails.updatedAt)
          : null,
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
