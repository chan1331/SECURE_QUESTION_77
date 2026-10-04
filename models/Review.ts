import mongoose, { Schema, Model } from 'mongoose';
import { IReview } from '@/types/paper';

const ReviewSchema = new Schema<IReview>(
  {
    paperId: {
      type: String,
      required: [true, 'Paper ID is required'],
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decision: {
      type: String,
      enum: ['Reviewed', 'Rejected'],
      required: true,
    },
    comments: {
      type: String,
      required: [true, 'Review comments are required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
