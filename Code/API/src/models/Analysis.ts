import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type AnalysisStatus = 'pending' | 'done' | 'failed';

// Minimal record linking a stored result blob to a user, doubling as the
// outbox row for durable S3 persistence. Only fields required to link the
// blob and drive the retry sweeper are stored.
export interface IAnalysis extends Document {
  userId: Types.ObjectId;
  status: AnalysisStatus;
  attempts: number;
  resultText: string | null; // pending payload; cleared once uploaded
  s3Key: string | null; // pointer to the blob, set on success
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'done', 'failed'],
    default: 'pending',
    index: true,
  },
  attempts: { type: Number, default: 0 },
  resultText: { type: String, default: null },
  s3Key: { type: String, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

export const Analysis: Model<IAnalysis> =
  mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', analysisSchema);
