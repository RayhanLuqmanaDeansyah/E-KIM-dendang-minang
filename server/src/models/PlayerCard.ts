import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IGameRoom } from './GameRoom';

export interface IPlayerCard extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  gameRoomId: mongoose.Types.ObjectId | IGameRoom;
  grid: Array<Array<number | null>>; // 6 rows x 9 columns
  color: 'PINK' | 'YELLOW' | 'BLUE' | 'GREEN' | 'WHITE';
  isTorn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerCardSchema = new Schema<IPlayerCard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameRoomId: { type: Schema.Types.ObjectId, ref: 'GameRoom', required: true },
    grid: { type: Schema.Types.Mixed, required: true }, // Storing as Mixed for 2D array support
    color: { type: String, enum: ['PINK', 'YELLOW', 'BLUE', 'GREEN', 'WHITE'], required: true },
    isTorn: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const PlayerCard = mongoose.model<IPlayerCard>('PlayerCard', playerCardSchema);
