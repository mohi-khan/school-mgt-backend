import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { classesModel, classSectionsModel, NewClasses } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createClasses = async (
  data: {
    classData: Omit<NewClasses, "classId" | "updatedAt" | "updatedBy">;
    sectionIds: number[];
  }
) => {
  const { classData, sectionIds } = data;

  try {
    return await db.transaction(async (tx) => {
      // 1️⃣ Insert Class and get ID
      const classId = await tx
        .insert(classesModel)
        .values({
          ...classData,
          createdAt: new Date(),
        })
        .$returningId(); // ✅ Correct for MySQL Drizzle

      // 2️⃣ Insert into classSectionsModel
      if (sectionIds && sectionIds.length > 0) {
        const sectionRecords = sectionIds.map((sectionId) => ({
          classId,
          sectionId,
          createdAt: new Date(),
        }));

        await tx.insert(classSectionsModel).values(sectionRecords);
      }

      return { classId, ...classData };
    });
  } catch (error) {
    throw error;
  }
};


// Get All
export const getAllClassess = async () => {
  return await db.select().from(classesModel)
}

// Get By Id
export const getClassesById = async (classId: number) => {
  const classes = await db
    .select()
    .from(classesModel)
    .where(eq(classesModel.classId, classId))
    .limit(1)

  if (!classes.length) {
    throw BadRequestError('Cloth classes not found')
  }

  return classes[0]
}

// Update
export const editClasses = async (
  classId: number,
  classesData: Partial<NewClasses>
) => {
  const [updatedClasses] = await db
    .update(classesModel)
    .set(classesData)
    .where(eq(classesModel.classId, classId))

  if (!updatedClasses) {
    throw BadRequestError('Cloth classes not found')
  }

  return updatedClasses
}
