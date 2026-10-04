import mongoose, { Schema, Model } from 'mongoose';
import { IQuestionPaper } from '@/types/paper';

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    paperId: {
      type: String,
      required: [true, 'Paper ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    encryptedContent: {
      type: String,
      required: [true, 'Encrypted content is required'],
      select: false, // Never return by default to frontend queries!
    },
    iv: {
      type: String,
      required: [true, 'IV is required'],
      select: false, // Protected cryptographic vector
    },
    hash: {
      type: String,
      required: [true, 'Integrity hash is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Created', 'Reviewed', 'Approved', 'Rejected'],
      default: 'Created',
      index: true,
    },
    examDate: {
      type: String,
    },
    examTime: {
      type: Date,
      index: true,
    },
    releaseStatus: {
      type: String,
      enum: ['Locked', 'Released'],
      default: 'Locked',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComments: {
      type: String,
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const QuestionPaper: Model<IQuestionPaper> =
  mongoose.models.QuestionPaper ||
  mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);

export default QuestionPaper;
