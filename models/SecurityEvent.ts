import mongoose, { Schema, Model } from 'mongoose';
import { ISecurityEvent } from '@/types/audit';

const SecurityEventSchema = new Schema<ISecurityEvent>(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    targetPaperId: {
      type: String,
      index: true,
    },
    deviceId: {
      type: String,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const SecurityEvent: Model<ISecurityEvent> =
  mongoose.models.SecurityEvent ||
  mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);

export default SecurityEvent;
