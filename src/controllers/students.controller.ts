import { Request, Response } from 'express'
import { createStudent } from '../services/students.service'

export const createStudentController = async (req: Request, res: Response) => {
  try {
    const data = req.body
    console.log("🚀 ~ createStudentController ~ data:", data)

    if (!data || !data.studentDetails || !data.studentFees) {
      return res.status(400).json({
        error: "Student data is required",
        receivedFields: Object.keys(req.body),
      })
    }

    // Directly use JSON from frontend
    const createdStudent = await createStudent(data)

    return res.json({ success: true, data: createdStudent })
  } catch (err) {
    console.error("Student creation error:", err)
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}