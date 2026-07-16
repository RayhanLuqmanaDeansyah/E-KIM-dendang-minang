import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash?: string;
  role: 'PLAYER' | 'SUPER_ADMIN' | 'OPERATOR' | 'VALIDATOR';
  balance: number;
  stats: {
    totalWins: number;
    cardsTorn: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['PLAYER', 'SUPER_ADMIN', 'OPERATOR', 'VALIDATOR'], default: 'PLAYER' },
    balance: { type: Number, default: 0 },
    stats: {
      totalWins: { type: Number, default: 0 },
      cardsTorn: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
