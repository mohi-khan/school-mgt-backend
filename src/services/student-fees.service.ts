import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  studentFeesModel,
} from '../schemas'

type FeeInput = {
  studentFeesId: number;
  paymentType: 'Paid' | 'Partial';
  paidAmount?: number;
};

export const collectFees = async (fees: FeeInput[]) => {
  if (!Array.isArray(fees) || fees.length === 0) {
    throw new Error('Fees array is required');
  }

  const results: {
    studentFeesId: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'Paid' | 'Partial';
  }[] = [];

  for (const fee of fees) {
    const { studentFeesId, paymentType, paidAmount } = fee;

    // Fetch current student fee record
    const feeRecord = await db
      .select({
        amount: studentFeesModel.amount,
        paidAmount: studentFeesModel.paidAmount,
        remainingAmount: studentFeesModel.remainingAmount,
      })
      .from(studentFeesModel)
      .where(eq(studentFeesModel.studentFeesId, studentFeesId))
      .then((res) => res[0]);

    if (!feeRecord) {
      throw new Error(`Student fee record not found for ID ${studentFeesId}`);
    }

    let newPaidAmount: number;
    let newRemainingAmount: number;
    let newStatus: 'Paid' | 'Partial';

    if (paymentType === 'Paid') {
      newPaidAmount = feeRecord.amount;
      newRemainingAmount = 0;
      newStatus = 'Paid';
    } else if (paymentType === 'Partial') {
      if (paidAmount === undefined || paidAmount <= 0) {
        throw new Error(`Paid amount is required for partial payment (ID ${studentFeesId})`);
      }
      if (paidAmount > feeRecord.amount) {
        throw new Error(`Paid amount cannot exceed total fee amount (ID ${studentFeesId})`);
      }

      newPaidAmount = paidAmount;
      newRemainingAmount = feeRecord.amount - paidAmount;
      newStatus = newRemainingAmount === 0 ? 'Paid' : 'Partial';
    } else {
      throw new Error(`Invalid payment type (ID ${studentFeesId})`);
    }

    // Update student fee record
    await db
      .update(studentFeesModel)
      .set({
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(studentFeesModel.studentFeesId, studentFeesId));

    results.push({
      studentFeesId,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
    });
  }

  return results;
};

export const getStudentFeesById = async (studentId: number) => {
  if (!studentId) {
    throw new Error('studentId is required');
  }

  const fees = await db
    .select({
      studentFeesId: studentFeesModel.studentFeesId,
      amount: studentFeesModel.amount,
      paidAmount: studentFeesModel.paidAmount,
      remainingAmount: studentFeesModel.remainingAmount,
      status: studentFeesModel.status,
      createdAt: studentFeesModel.createdAt,
      updatedAt: studentFeesModel.updatedAt,
    })
    .from(studentFeesModel)
    .where(eq(studentFeesModel.studentId, studentId));

  return fees;
};
