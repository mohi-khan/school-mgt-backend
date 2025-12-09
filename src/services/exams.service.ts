import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { classesModel, examGroupsModel, examsModel, examSubjectsModel, NewExam, sessionsModel } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExam = async (
  examsData: Omit<NewExam, 'examId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newExam] = await db.insert(examsModel).values({
      ...examsData,
      createdAt: new Date(),
    })

    return newExam
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExams = async () => {
  return await db
    .select({
      // exams table fields
      examId: examsModel.examId,
      examName: examsModel.examName,
      examGroupsId: examsModel.examGroupsId,
      sessionId: examsModel.sessionId,
      classId: examsModel.classId,
      examSubjectId: examsModel.examSubjectId,
      createdBy: examsModel.createdBy,
      createdAt: examsModel.createdAt,
      updatedBy: examsModel.updatedBy,
      updatedAt: examsModel.updatedAt,
      examGroupName: examGroupsModel.examGroupName,
      sessionName: sessionsModel.sessionName,
      className: classesModel.className,
      subjectName: examSubjectsModel.subjectName,
    })
    .from(examsModel)
    .leftJoin(
      examGroupsModel,
      eq(examsModel.examGroupsId, examGroupsModel.examGroupsId)
    )
    .leftJoin(sessionsModel, eq(examsModel.sessionId, sessionsModel.sessionId))
    .leftJoin(classesModel, eq(examsModel.classId, classesModel.classId))
    .leftJoin(
      examSubjectsModel,
      eq(examsModel.examSubjectId, examSubjectsModel.examSubjectId)
    )
}

// Get By Id
export const getExamById = async (examId: number) => {
  const exams = await db
    .select()
    .from(examsModel)
    .where(eq(examsModel.examId, examId))
    .limit(1)

  if (!exams.length) {
    throw BadRequestError('Cloth exams not found')
  }

  return exams[0]
}

// Update
export const editExam = async (
  examId: number,
  examsData: Partial<NewExam>
) => {
  const [updatedExam] = await db
    .update(examsModel)
    .set(examsData)
    .where(eq(examsModel.examId, examId))

  if (!updatedExam) {
    throw BadRequestError('Cloth exams not found')
  }

  return updatedExam
}

// Delete
export const deleteExam = async (examId: number) => {
  const result = await db
    .delete(examsModel)
    .where(eq(examsModel.examId, examId));
  return { message: "Fees Group deleted successfully" };
};
