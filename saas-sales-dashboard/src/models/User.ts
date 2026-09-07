import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  image?: string;
  passwordHash?: string;
  googleId?: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String },
    image: { type: String },
    passwordHash: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ['admin', 'analyst', 'viewer'], default: 'admin' },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
