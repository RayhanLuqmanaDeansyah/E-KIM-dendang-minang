import mongoose, { Schema, Document } from 'mongoose';

export interface IPantun extends Document {
  numberTarget: number;
  text: string;
  language: string;
  category: string;
  usageCount: number;
}

const pantunSchema = new Schema<IPantun>(
  {
    numberTarget: { type: Number, required: true },
    text: { type: String, required: true },
    language: { type: String, default: 'min' },
    category: { type: String, default: 'humor' },
    usageCount: { type: Number, default: 0 }
  }
);

export const Pantun = mongoose.model<IPantun>('Pantun', pantunSchema);
