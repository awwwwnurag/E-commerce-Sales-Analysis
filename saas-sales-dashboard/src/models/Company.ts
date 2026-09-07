import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  plan: 'free' | 'monthly' | 'yearly';
  settings: {
    currency: string;
    theme_color: string;
    logo_url: string | null;
    fiscal_year_start: number;
    google_maps_api_key?: string | null;
  };
  stripeCustomerId?: string;
  subscriptionId?: string;
  createdAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    plan: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
    settings: {
      currency: { type: String, default: 'INR' },
      theme_color: { type: String, default: '#6366f1' },
      logo_url: { type: String, default: null },
      fiscal_year_start: { type: Number, default: 1 },
      google_maps_api_key: { type: String, default: null },
    },
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
  },
  { timestamps: true }
);

export const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
