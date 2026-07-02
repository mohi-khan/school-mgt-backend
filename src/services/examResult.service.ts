import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  divisionModel,
  examGroupsModel,
  examResultModel,
  examsModel,
  examSubjectsModel,
  NewExamResult,
  sectionsModel,
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
export const getAllExamResults = async (tenantId: number) => {
  return await db
    .select({
      examResultId: examResultModel.examResultId,
      divisionId: examResultModel.divisionId,
      divisionName: divisionModel.divisionName,
      classId: examResultModel.classId,
      className: classesModel.className,
      sessionId: examResultModel.sessionId,
      sessionName: sessionsModel.sessionName,
      examGroupsId: examResultModel.examGroupsId,
      examGroupName: examGroupsModel.examGroupName,
      studentId: examResultModel.studentId,
      studentName: sql<string>`
        CONCAT(${studentsModel.firstName}, ' ', ${studentsModel.lastName})
      `.as('student_name'),
      examSubjectId: examResultModel.examSubjectId,
      examSubjectName: examSubjectsModel.subjectName,
      gainedMarks: examResultModel.gainedMarks,
      totalMarks: examSubjectsModel.examMarks,
      createdBy: examResultModel.createdBy,
      createdAt: examResultModel.createdAt,
      updatedBy: examResultModel.updatedBy,
      updatedAt: examResultModel.updatedAt,
    })
    .from(examResultModel)
    .where(eq(examResultModel.tenantId, tenantId))
    .leftJoin(
      sessionsModel,
      eq(examResultModel.sessionId, sessionsModel.sessionId)
    )
    .leftJoin(
      examGroupsModel,
      eq(examResultModel.examGroupsId, examGroupsModel.examGroupsId)
    )
    .leftJoin(
      studentsModel,
      eq(examResultModel.studentId, studentsModel.studentId)
    )
    .leftJoin(
      examSubjectsModel,
      eq(examResultModel.examSubjectId, examSubjectsModel.examSubjectId)
    )
    .leftJoin(
      divisionModel,
      eq(studentsModel.divisionId, divisionModel.divisionId)
    )
    .leftJoin(classesModel, eq(studentsModel.classId, classesModel.classId))
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
