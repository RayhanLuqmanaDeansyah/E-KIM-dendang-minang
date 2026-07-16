import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IGameRoom extends Document {
  roomName: string;
  status: 'WAITING' | 'PLAYING' | 'PAUSED' | 'FINISHED';
  currentColor: 'PINK' | 'YELLOW' | 'BLUE' | 'GREEN' | 'WHITE';
  drawnNumbers: number[];
  audioUrl?: string;
  eventHistory: Array<{
    time: Date;
    type: string;
    data: any;
  }>;
  winners: {
    pink?: mongoose.Types.ObjectId | IUser;
    yellow?: mongoose.Types.ObjectId | IUser;
    blue?: mongoose.Types.ObjectId | IUser;
    green?: mongoose.Types.ObjectId | IUser;
    white?: mongoose.Types.ObjectId | IUser;
  };
  createdAt: Date;
  updatedAt: Date;
}

const gameRoomSchema = new Schema<IGameRoom>(
  {
    roomName: { type: String, required: true },
    status: { type: String, enum: ['WAITING', 'PLAYING', 'PAUSED', 'FINISHED'], default: 'WAITING' },
    currentColor: { type: String, enum: ['PINK', 'YELLOW', 'BLUE', 'GREEN', 'WHITE'], default: 'PINK' },
    drawnNumbers: [{ type: Number }],
    audioUrl: { type: String },
    eventHistory: [
      {
        time: { type: Date, default: Date.now },
        type: { type: String, required: true },
        data: { type: Schema.Types.Mixed }
      }
    ],
    winners: {
      pink: { type: Schema.Types.ObjectId, ref: 'User' },
      yellow: { type: Schema.Types.ObjectId, ref: 'User' },
      blue: { type: Schema.Types.ObjectId, ref: 'User' },
      green: { type: Schema.Types.ObjectId, ref: 'User' },
      white: { type: Schema.Types.ObjectId, ref: 'User' }
    }
  },
  { timestamps: true }
);

export const GameRoom = mongoose.model<IGameRoom>('GameRoom', gameRoomSchema);
