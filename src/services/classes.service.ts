import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  classSectionsModel,
  NewClasses,
  sectionsModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createClasses = async (data: {
  classData: Omit<NewClasses, 'classId' | 'updatedAt' | 'updatedBy'>
  sectionIds: number[]
}) => {
  const { classData, sectionIds } = data

  try {
    return await db.transaction(async (tx) => {
      // Insert class and get the result
      const [insertedClass] = await tx
        .insert(classesModel)
        .values({
          ...classData,
          createdAt: new Date(),
        })
        .$returningId() // ✅ Use $returningId() if available

      const classId = insertedClass.classId

      // If $returningId() doesn't work, try this alternative:
      // const result = await tx.insert(classesModel).values({...}).returning({ id: classesModel.classId });
      // const classId = result[0].id;

      if (!classId || typeof classId !== 'number' || classId <= 0) {
        console.error('Failed to retrieve a valid classId')
        throw new Error(
          'Failed to create class: Could not retrieve the new class ID.'
        )
      }

      // Insert sections
      if (sectionIds.length > 0) {
        const sectionRecords = sectionIds.map((sectionId) => ({
          classId,
          sectionId,
          createdAt: new Date(),
        }))

        await tx.insert(classSectionsModel).values(sectionRecords)
      }

      return { classId, ...classData }
    })
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllClasses = async () => {
  // 1) Fetch all classes
  const classes = await db.select().from(classesModel)

  // 2) Fetch all class-section mappings
  const classSections = await db.select().from(classSectionsModel)

  // 4) Build final response in shape of createClassSchema
  const result = classes.map((cls) => {
    // find sectionIds for this class
    const relatedSectionIds = classSections
      .filter((cs) => cs.classId === cls.classId)
      .map((cs) => cs.sectionId)

    return {
      classData: {
        className: cls.className,
        classCode: cls.classCode,
        description: cls.description,
        isActive: cls.isActive,
      },
      sectionIds: relatedSectionIds,
    }
  })

  return result
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
