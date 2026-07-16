import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { GameRoom } from '../models/GameRoom';
import { Pantun } from '../models/Pantun';
import { PlayerCard } from '../models/PlayerCard';
import { generateKIMCard } from '../utils/cardGenerator';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

const activeIntervals = new Map<string, NodeJS.Timeout>();

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Allow all origins for dev
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Reconnect & Auto-resume logic
    socket.on('JOIN_ROOM', async (payload) => {
      try {
        const { roomId, token } = payload;
        if (!token) {
          socket.emit('error', { message: 'No token provided' });
          return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        const userId = decoded.id;

        const room = await GameRoom.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        let card = await PlayerCard.findOne({ gameRoomId: roomId, userId });

        // Auto-generate card for players if they don't have one
        if (!card && decoded.role === 'PLAYER') {
          // Seed based on roomId + userId so it's deterministic but unique per player
          const seed = `${roomId}-${userId}`;
          const grid = generateKIMCard(seed);
          card = await PlayerCard.create({
            gameRoomId: roomId,
            userId,
            grid,
            color: 'PINK',
            isTorn: false
          });
        }

        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);

        // Auto-resume: Send last state
        socket.emit('ROOM_STATE_UPDATE', {
          status: room.status,
          currentColor: room.currentColor,
          drawnNumbers: room.drawnNumbers,
          card: card ? { grid: card.grid, isTorn: card.isTorn } : null
        });

      } catch (err) {
        socket.emit('error', { message: 'Invalid token or room error' });
      }
    });

    socket.on('SYNC_DAUB', (payload) => {
      // Stub for Sync Daub / Auto-save coretan pemain
      // In a real production scale, save this to Redis
    });

    socket.on('START_GAME', async (payload) => {
      try {
        const { roomId, token } = payload;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

        // Ensure only admin or operator can start
        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'OPERATOR') {
          socket.emit('error', { message: 'Unauthorized to start game' });
          return;
        }

        const room = await GameRoom.findById(roomId);
        if (room && (room.status === 'WAITING' || room.status === 'PAUSED')) {
          room.status = 'PLAYING';
          await room.save();
          io.to(roomId).emit('ROOM_STATE_UPDATE', { status: 'PLAYING', currentColor: room.currentColor });
        }
      } catch (err) {
        console.error('Failed to start game:', err);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    socket.on('CLAIM_KIM', async (payload) => {
      try {
        const { roomId, token } = payload;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        const userId = decoded.id;

        const room = await GameRoom.findById(roomId);
        if (!room || room.status !== 'PLAYING') {
          socket.emit('CLAIM_RESULT', { valid: false, message: 'Game is not playing' });
          return;
        }

        const card = await PlayerCard.findOne({ gameRoomId: roomId, userId });
        if (!card || card.isTorn) {
          socket.emit('CLAIM_RESULT', { valid: false, message: 'Invalid claim. Card torn.' });
          return;
        }

        // Pause the game automatically
        if (activeIntervals.has(roomId)) {
          clearInterval(activeIntervals.get(roomId));
          activeIntervals.delete(roomId);
        }
        room.status = 'PAUSED';
        await room.save();
        io.to(roomId).emit('ROOM_STATE_UPDATE', { status: 'PAUSED' });

        // Broadcast suspense event
        io.to(roomId).emit('ROOM_EVENT', { message: 'Ada yang masuk! Memverifikasi kartu...' });

        // Wait 3 seconds for suspense
        setTimeout(async () => {
          try {
            // Re-fetch room just in case
            const currentRoom = await GameRoom.findById(roomId);
            if (!currentRoom) return;

            const playerDaubs = payload.daubs as string[] || [];
            let completedRows = 0;
            const drawnSet = new Set(currentRoom.drawnNumbers || []);

            // Count daubs per row
            const rowDaubs: Record<number, number[]> = {};
            for (const key of playerDaubs) {
              const [r, c] = key.split('-').map(Number);
              if (!rowDaubs[r]) rowDaubs[r] = [];
              const cellValue = card.grid[r][c];
              if (cellValue !== null) {
                rowDaubs[r].push(cellValue);
              }
            }

            for (let r = 0; r < 6; r++) {
              if (rowDaubs[r] && rowDaubs[r].length === 5) {
                // The player has fully daubed this row. Let's verify if all 5 numbers are actually drawn.
                if (rowDaubs[r].every(num => drawnSet.has(num))) {
                  completedRows++;
                }
              }
            }

            const colorToTargetRows: Record<string, number> = {
              'PINK': 1, 'YELLOW': 2, 'BLUE': 3, 'GREEN': 4, 'WHITE': 5
            };
            const targetRows = colorToTargetRows[currentRoom.currentColor];

            if (completedRows >= targetRows) {
              // WIN!
              socket.emit('CLAIM_RESULT', { valid: true, message: 'KIM!' });
              io.to(roomId).emit('ROOM_EVENT', { message: `Pemain menang di fase ${currentRoom.currentColor}!` });
              // Note: game stays PAUSED. Admin must resume or move phase.
            } else {
              // LOSE! Tear the card ONLY if it is the WHITE phase
              if (currentRoom.currentColor === 'WHITE') {
                card.isTorn = true;
                await card.save();
                socket.emit('CLAIM_RESULT', { valid: false, message: 'Klaim Salah! Kartu dirobek.' });
                io.to(roomId).emit('ROOM_EVENT', { message: 'Klaim gagal! Permainan dilanjutkan...' });
              } else {
                socket.emit('CLAIM_RESULT', { valid: false, message: 'Klaim belum lengkap! Lanjutkan permainan.' });
                io.to(roomId).emit('ROOM_EVENT', { message: 'Klaim gagal! Permainan dilanjutkan...' });
              }

              // Resume game
              currentRoom.status = 'PLAYING';
              await currentRoom.save();
              io.to(roomId).emit('ROOM_STATE_UPDATE', { status: 'PLAYING' });
            }
          } catch (e) {
            console.error('Error during claim validation:', e);
          }
        }, 3000);

      } catch (err) {
        console.error('Failed to process claim:', err);
        socket.emit('CLAIM_RESULT', { valid: false, message: 'Error processing claim' });
      }
    });

    socket.on('PAUSE_GAME', async (payload) => {
      try {
        const { roomId, token } = payload;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'OPERATOR') {
          socket.emit('error', { message: 'Unauthorized to pause game' });
          return;
        }

        const room = await GameRoom.findById(roomId);
        if (room && room.status === 'PLAYING') {
          room.status = 'PAUSED';
          await room.save();
          io.to(roomId).emit('ROOM_STATE_UPDATE', { status: 'PAUSED' });

          if (activeIntervals.has(roomId)) {
            clearInterval(activeIntervals.get(roomId));
            activeIntervals.delete(roomId);
          }
        }
      } catch (err) {
        console.error('Failed to pause game:', err);
        socket.emit('error', { message: 'Failed to pause game' });
      }
    });

    socket.on('ADMIN_DRAW_NUMBER', async (payload) => {
      try {
        const { roomId, token, number } = payload;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'OPERATOR') return;

        const room = await GameRoom.findById(roomId);
        if (!room || room.status !== 'PLAYING') return;

        if (!room.drawnNumbers.includes(number)) {
          room.drawnNumbers.push(number);
          room.eventHistory.push({
            time: new Date(),
            type: 'DRAW',
            data: { number }
          });
          await room.save();
          io.to(roomId).emit('NUMBER_DRAWN', { number, pantun: `Angka keluar: ${number}` });
        }
      } catch (err) {
        console.error('Failed to draw number:', err);
      }
    });

    socket.on('ADMIN_AUDIO_SYNC', async (payload) => {
      try {
        const { roomId, token, action, time } = payload;
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'OPERATOR') return;

        io.to(roomId).emit('AUDIO_SYNC', { action, time });
      } catch (err) {
        console.error('Failed to sync audio:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
