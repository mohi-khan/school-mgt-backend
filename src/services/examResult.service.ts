import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  examResultModel,
  examsModel,
  examSubjectsModel,
  NewExamResult,
  sessionsModel,
  studentsModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExamResult = async (
  examResultData: Omit<
    NewExamResult,
    'examResultId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const [newExamResult] = await db.insert(examResultModel).values({
      ...examResultData,
      createdAt: new Date(),
    })
    console.log("🚀 ~ createExamResult ~ newExamResult:", newExamResult)

    return newExamResult
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExamResults = async () => {
  return await db
    .select({
      examResultId: examResultModel.examResultId,
      sessionId: examResultModel.sessionId,
      examId: examResultModel.examId,
      studentId: examResultModel.studentId,
      examSubjectId: examResultModel.examSubjectId,
      gainedMarks: examResultModel.gainedMarks,
      createdBy: examResultModel.createdBy,
      createdAt: examResultModel.createdAt,
      updatedBy: examResultModel.updatedBy,
      updatedAt: examResultModel.updatedAt,
      sessionName: sessionsModel.sessionName,
      examName: examsModel.examName,
      studentName: sql<string>`
        CONCAT(${studentsModel.firstName}, ' ', ${studentsModel.lastName})
      `.as('student_name'),
      examSubjectName: examSubjectsModel.subjectName,
    })
    .from(examResultModel)
    .leftJoin(
      sessionsModel,
      eq(examResultModel.sessionId, sessionsModel.sessionId)
    )
    .leftJoin(examsModel, eq(examResultModel.examId, examsModel.examId))
    .leftJoin(
      studentsModel,
      eq(examResultModel.studentId, studentsModel.studentId)
    )
    .leftJoin(
      examSubjectsModel,
      eq(examResultModel.examSubjectId, examSubjectsModel.examSubjectId)
    )
}

// Get By Id
export const getExamResultById = async (examResultId: number) => {
  const examResult = await db
    .select()
    .from(examResultModel)
    .where(eq(examResultModel.examResultId, examResultId))
    .limit(1)

  if (!examResult.length) {
    throw BadRequestError('Cloth examResult not found')
  }

  return examResult[0]
}

// Update
export const editExamResult = async (
  examResultId: number,
  examResultData: Partial<NewExamResult>
) => {
  const [updatedExamResult] = await db
    .update(examResultModel)
    .set(examResultData)
    .where(eq(examResultModel.examResultId, examResultId))

  if (!updatedExamResult) {
    throw BadRequestError('Cloth examResult not found')
  }

  return updatedExamResult
}

// Delete
export const deleteExamResult = async (examResultId: number) => {
  const result = await db
    .delete(examResultModel)
    .where(eq(examResultModel.examResultId, examResultId))
  return { message: 'Fees Group deleted successfully' }
}
