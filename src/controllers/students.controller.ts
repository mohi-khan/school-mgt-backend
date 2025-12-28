import { Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudentWithFees,
} from '../services/students.service'

export const createStudentController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'create_student')

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`

    // Normalize input to array
    const payload = Array.isArray(req.body) ? req.body : [req.body]

    const results = []
    for (let item of payload) {
      // Parse studentDetails & studentFees if sent as JSON strings
      let studentDetails =
        typeof item.studentDetails === 'string'
          ? JSON.parse(item.studentDetails)
          : item.studentDetails
      let studentFees =
        typeof item.studentFees === 'string'
          ? JSON.parse(item.studentFees)
          : item.studentFees

      // Handle uploaded photos (if any)
      if (files?.photoUrl?.[0])
        studentDetails.photoUrl = `${baseUrl}${files.photoUrl[0].filename}`
      if (files?.fatherPhotoUrl?.[0])
        studentDetails.fatherPhotoUrl = `${baseUrl}${files.fatherPhotoUrl[0].filename}`
      if (files?.motherPhotoUrl?.[0])
        studentDetails.motherPhotoUrl = `${baseUrl}${files.motherPhotoUrl[0].filename}`

      const student = await createStudent({ studentDetails, studentFees })
      results.push(student)
    }

    res.status(200).json({
      success: true,
      data: Array.isArray(req.body) ? results : results[0],
    })
  } catch (error: any) {
    console.error('❌ Student creation error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}

// students.controller.ts
export const updateStudentController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'edit_student')

    const studentId = Number(req.params.id)
    if (!studentId) {
      res.status(400).json({ error: 'Invalid student ID' })
    }

    console.log('📥 Received files:', req.files)
    console.log('📥 Received body:', req.body)

    // Parse JSON from FormData
    const studentDetails = JSON.parse(req.body.studentDetails)
    const studentFees = JSON.parse(req.body.studentFees)

    if (!studentDetails || !Array.isArray(studentFees)) {
      res.status(400).json({
        error: 'Invalid payload',
      })
    }

    // Handle file uploads
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[]
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`

    if (files?.photoUrl?.[0]) {
      studentDetails.photoUrl = `${baseUrl}${files.photoUrl[0].filename}`
    }
    if (files?.fatherPhotoUrl?.[0]) {
      studentDetails.fatherPhotoUrl = `${baseUrl}${files.fatherPhotoUrl[0].filename}`
    }
    if (files?.motherPhotoUrl?.[0]) {
      studentDetails.motherPhotoUrl = `${baseUrl}${files.motherPhotoUrl[0].filename}`
    }

    const updatedStudent = await updateStudentWithFees({
      studentId,
      studentDetails,
      studentFees,
    })

    res.json({ success: true, data: updatedStudent })
  } catch (err) {
    console.error('❌ Student update error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export const getAllStudentsController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_student')

    const classId = req.query.classId ? Number(req.query.classId) : null
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : null

    const data = await getAllStudents(classId, sectionId)

    res.json(data)
  } catch (error) {
    console.error('Get All Students Error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getStudentByIdController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_student')
    const studentId = Number(req.params.id)
    const data = await getStudentById(studentId)

    if (!data)
      res.status(404).json({ success: false, message: 'Student not found' })

    res.json(data)
  } catch (error) {
    console.error('Get Student By ID Error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const deleteStudentController = async (req: any, res: any) => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: 'id is required' })
    }

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
    }

    const result = await deleteStudent(id)

    res.status(200).json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
