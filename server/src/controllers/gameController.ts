import { Response } from 'express';
import { GameRoom } from '../models/GameRoom';
import { PlayerCard } from '../models/PlayerCard';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const claimKim = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.body;
    const userId = req.user!.id;

    const room = await GameRoom.findById(roomId);
    if (!room) {
      res.status(404).json({ valid: false, message: 'Room not found' });
      return;
    }

    if (room.status !== 'PLAYING') {
      res.status(400).json({ valid: false, message: 'Game is not in playing state' });
      return;
    }

    const card = await PlayerCard.findOne({ gameRoomId: roomId, userId });
    if (!card) {
      res.status(404).json({ valid: false, message: 'Card not found for this user in the room' });
      return;
    }

    if (card.isTorn) {
      res.status(400).json({ valid: false, message: 'Invalid claim. Card torn.' });
      return;
    }

    const colorToTargetRows: Record<string, number> = {
      'PINK': 1,
      'YELLOW': 2,
      'BLUE': 3,
      'GREEN': 4,
      'WHITE': 5
    };
    const targetRows = colorToTargetRows[room.currentColor];

    let completedRows = 0;
    const drawnSet = new Set(room.drawnNumbers || []);

    for (let r = 0; r < 6; r++) {
      const numbersInRow = card.grid[r].filter(val => val !== null) as number[];
      if (numbersInRow.length === 5) {
        if (numbersInRow.every(num => drawnSet.has(num))) {
          completedRows++;
        }
      }
    }

    if (completedRows >= targetRows) {
      res.status(200).json({ valid: true, message: 'KIM!' });
    } else {
      if (room.currentColor === 'WHITE') {
        card.isTorn = true;
        await card.save();
        res.status(400).json({ valid: false, message: 'Invalid claim. Card torn.' });
      } else {
        res.status(400).json({ valid: false, message: 'Invalid claim. Target not met yet.' });
      }
    }
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Server error', error });
  }
};

export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'OPERATOR') {
      res.status(403).json({ message: 'Not authorized to create rooms' });
      return;
    }
    
    const roomName = req.body.roomName || `Room-${Math.floor(Math.random() * 1000)}`;
    const room = await GameRoom.create({
      roomName: roomName,
      status: 'WAITING',
      currentColor: 'PINK',
      drawnNumbers: [],
      eventHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await GameRoom.find().sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const uploadAudio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let role = req.user?.role;
    if (role !== 'SUPER_ADMIN' && role !== 'OPERATOR') {
      // Fallback: check database in case token is stale
      if (req.user?.id) {
        const user = await User.findById(req.user.id);
        if (user) {
          role = user.role;
        }
      }
    }

    if (role !== 'SUPER_ADMIN' && role !== 'OPERATOR') {
      res.status(403).json({ message: `Not authorized. Role is ${role}` });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const roomId = req.body.roomId;
    if (!roomId) {
      res.status(400).json({ message: 'roomId is required' });
      return;
    }

    const room = await GameRoom.findById(roomId);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    // Assuming audioUrl is added to GameRoom schema
    (room as any).audioUrl = fileUrl;
    await room.save();

    res.status(200).json({ message: 'Audio uploaded successfully', audioUrl: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'OPERATOR') {
      res.status(403).json({ message: 'Not authorized to delete rooms' });
      return;
    }

    const roomId = req.params.id;
    if (!roomId) {
      res.status(400).json({ message: 'roomId is required' });
      return;
    }

    const room = await GameRoom.findByIdAndDelete(roomId);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // Optionally delete associated PlayerCards
    await PlayerCard.deleteMany({ gameRoomId: roomId });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
