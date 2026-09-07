import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISalesUpload extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  filename: string;
  rowCount: number;
  status: 'pending' | 'completed' | 'failed';
  uploadedAt: Date;
}

const SalesUploadSchema = new Schema<ISalesUpload>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    rowCount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const SalesUpload: Model<ISalesUpload> =
  mongoose.models.SalesUpload || mongoose.model<ISalesUpload>('SalesUpload', SalesUploadSchema);
