import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  examGroupsModel,
  examSubjectsModel,
  NewExamSubjects,
  sessionsModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExamSubjects = async (
  examSubjectsData: Omit<
    NewExamSubjects,
    'examSubjectsId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const payload = Array.isArray(examSubjectsData)
      ? examSubjectsData
      : [examSubjectsData]
    console.log("🚀 ~ createExamSubjects ~ payload:", payload)

    const values = payload.map((item) => ({
      ...item,
      createdAt: new Date(),
    }))
    console.log("🚀 ~ createExamSubjects ~ values:", values)

    const result = await db.insert(examSubjectsModel).values(values)

    return result
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExamSubjectss = async () => {
  return await db
    .select({
      examSubjectId: examSubjectsModel.examSubjectId,
      examGroupsId: examSubjectsModel.examGroupsId,
      examGroupName: examGroupsModel.examGroupName,
      subjectName: examSubjectsModel.subjectName,
      subjectCode: examSubjectsModel.subjectCode,
      examDate: examSubjectsModel.examDate,
      startTime: examSubjectsModel.startTime,
      duration: examSubjectsModel.duration,
      examMarks: examSubjectsModel.examMarks,
      classId: examSubjectsModel.classId,
      sessionId: examSubjectsModel.sessionId,
      sessionName: sessionsModel.sessionName,
      className: classesModel.className,
      createdBy: examSubjectsModel.createdBy,
      createdAt: examSubjectsModel.createdAt,
      updatedBy: examSubjectsModel.updatedBy,
      updatedAt: examSubjectsModel.updatedAt,
    })
    .from(examSubjectsModel)
    .leftJoin(examGroupsModel, eq(examSubjectsModel.examGroupsId, examGroupsModel.examGroupsId))
    .leftJoin(classesModel, eq(examSubjectsModel.classId, classesModel.classId))
    .leftJoin(
      sessionsModel,
      eq(examSubjectsModel.sessionId, sessionsModel.sessionId)
    )
}

// Get By Id
export const getExamSubjectsById = async (examSubjectsId: number) => {
  const examSubjects = await db
    .select()
    .from(examSubjectsModel)
    .where(eq(examSubjectsModel.examSubjectId, examSubjectsId))
    .limit(1)

  if (!examSubjects.length) {
    throw BadRequestError('Cloth examSubjects not found')
  }

  return examSubjects[0]
}

// Update
export const editExamSubjects = async (
  examSubjectsId: number,
  examSubjectsData: Partial<NewExamSubjects>
) => {
  const [updatedExamSubjects] = await db
    .update(examSubjectsModel)
    .set(examSubjectsData)
    .where(eq(examSubjectsModel.examSubjectId, examSubjectsId))

  if (!updatedExamSubjects) {
    throw BadRequestError('Cloth examSubjects not found')
  }

  return updatedExamSubjects
}

// Delete
export const deleteExamSubjects = async (examSubjectsId: number) => {
  const result = await db
    .delete(examSubjectsModel)
    .where(eq(examSubjectsModel.examSubjectId, examSubjectsId))
  return { message: 'Fees Group deleted successfully' }
}
