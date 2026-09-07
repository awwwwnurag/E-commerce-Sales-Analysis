import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISalesRecord extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  uploadId: mongoose.Types.ObjectId;
  date: Date;
  product: string;
  quantity: number;
  revenue: number;
  cost: number;
  customer: string;
  region: string;
  customerDetails?: string;
  category?: string;
  discount?: number;
  channel?: string;
}

const SalesRecordSchema = new Schema<ISalesRecord>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    uploadId: { type: Schema.Types.ObjectId, ref: 'SalesUpload', required: true },
    date: { type: Date, required: true },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    revenue: { type: Number, required: true },
    cost: { type: Number, required: true },
    customer: { type: String, required: true },
    region: { type: String, required: true },
    customerDetails: { type: String, default: null },
    category: { type: String, default: 'N/A' },
    discount: { type: Number, default: 0 },
    channel: { type: String, default: 'N/A' },
  },
  { timestamps: false }
);

// Compound index for fast per-company filtered queries
SalesRecordSchema.index({ companyId: 1, date: 1 });
SalesRecordSchema.index({ companyId: 1, product: 1 });
SalesRecordSchema.index({ companyId: 1, region: 1 });

export const SalesRecord: Model<ISalesRecord> =
  mongoose.models.SalesRecord || mongoose.model<ISalesRecord>('SalesRecord', SalesRecordSchema);
