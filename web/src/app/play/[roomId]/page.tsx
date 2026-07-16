"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import KimCard from '@/components/KimCard';
import VirtualDendang3D from '@/components/VirtualDendang3D';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type RoomState = 'WAITING' | 'PLAYING' | 'FINISHED';
type ColorPhase = 'PINK' | 'YELLOW' | 'BLUE' | 'GREEN' | 'WHITE';

export default function PlayRoom() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState>('WAITING');
  const [currentColor, setCurrentColor] = useState<ColorPhase>('PINK');
  const [drawnHistory, setDrawnHistory] = useState<{ number: number; pantun: string }[]>([]);
  const [cardGrid, setCardGrid] = useState<Array<Array<number | null>> | undefined>(undefined);
  const [isTorn, setIsTorn] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [lastDrawnNumber, setLastDrawnNumber] = useState<number | null>(null);

  const [daubs, setDaubs] = useState<Set<string>>(new Set());
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio Element Ref for Sync
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background Music Setup (now synced via Admin)
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(SOCKET_URL + audioUrl);
      audioRef.current.loop = false; // It's a full song
    }
    return () => {
      audioRef.current?.pause();
    };
  }, [audioUrl]);

  // Socket Logic
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'dummy-token' : 'dummy-token';

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      newSocket.emit('JOIN_ROOM', { roomId, token });
    });

    newSocket.on('ROOM_STATE_UPDATE', (data: any) => {
      if (data.status) setRoomState(data.status);
      if (data.currentColor) setCurrentColor(data.currentColor);
      if (data.audioUrl) setAudioUrl(data.audioUrl);

      if (data.card) {
        setCardGrid(data.card.grid);
        setIsTorn(data.card.isTorn);
      }

      if (data.status === 'PAUSED' && audioRef.current) {
        audioRef.current.pause();
      }
    });

    newSocket.on('NUMBER_DRAWN', (data: { number: number; pantun: string }) => {
      setDrawnHistory(prev => [data, ...prev]);
      setLastDrawnNumber(data.number);

      // Removed TTS here, Admin is managing the song.
      setTimeout(() => {
        setLastDrawnNumber(null);
      }, 3000);
    });

    newSocket.on('AUDIO_SYNC', (data: { action: 'PLAY' | 'PAUSE' | 'SEEK'; time: number }) => {
      if (!audioRef.current) return;

      if (data.action === 'SEEK') {
        audioRef.current.currentTime = data.time;
      } else if (data.action === 'PLAY') {
        audioRef.current.currentTime = data.time;
        audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
      } else if (data.action === 'PAUSE') {
        audioRef.current.pause();
        audioRef.current.currentTime = data.time;
      }
    });

    newSocket.on('error', (err: any) => {
      console.error('Socket Error:', err);
    });

    newSocket.on('CLAIM_RESULT', (res: { valid: boolean; message: string }) => {
      if (res.valid) {
        setClaimMessage('KLAIM BERHASIL! Anda memenangkan fase ini!');
      } else {
        setClaimMessage(res.message);
        if (res.message.toLowerCase().includes('robek') || res.message.toLowerCase().includes('torn')) {
          setIsTorn(true);
        }
      }
      setTimeout(() => setClaimMessage(null), 5000);
    });

    newSocket.on('ROOM_EVENT', (data: { message: string }) => {
      setClaimMessage(data.message); // Use the same alert box for suspense messages
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleToggleDaub = (rIndex: number, cIndex: number, cell: number | null) => {
    const key = `${rIndex}-${cIndex}`;
    setDaubs(prev => {
      const newDaubs = new Set(prev);
      if (newDaubs.has(key)) newDaubs.delete(key);
      else newDaubs.add(key);
      return newDaubs;
    });
  };

  const handleClaim = () => {
    const token = localStorage.getItem('token');
    if (socket) {
      // Convert daubs Set to Array to send over socket
      socket.emit('CLAIM_KIM', { roomId, token, daubs: Array.from(daubs) });
    }
  };

  const colorPhaseProp = currentColor.toLowerCase() as any;

  return (
    <div className="h-screen w-full overflow-hidden stage-lights-bg p-0 m-0">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-5 gap-0 items-start m-0">
        {/* Kiri: Kertas KIM (80%) */}
        <div className="lg:col-span-4 w-full h-screen overflow-hidden flex flex-col items-center justify-center pt-2 pb-2 px-4 lg:px-12">
          <div className="mb-2 text-center">
            <h2 className="text-xl font-bold font-sans">
              Status: <span className={roomState === 'PLAYING' ? 'text-green-600' : 'text-gray-500'}>{roomState}</span>
            </h2>
            <p className="text-sm text-gray-500 mb-1">Room ID: {roomId}</p>
            <p className="text-sm text-gray-900 font-bold bg-white/60 px-4 py-1 rounded-full inline-block shadow-sm border border-white capitalize">
              Bermain di kertas {currentColor}
            </p>
          </div>

          <KimCard
            colorPhase={colorPhaseProp}
            grid={cardGrid}
            isTorn={isTorn}
            daubs={daubs}
            onToggleDaub={handleToggleDaub}
          />

          <button
            onClick={handleClaim}
            disabled={roomState !== 'PLAYING' || isTorn}
            className={`mt-4 w-full max-w-sm py-3 rounded-full text-4xl font-black tracking-widest text-white shadow-2xl transition-all transform active:scale-95
            ${roomState === 'PLAYING' && !isTorn
                ? 'bg-kim-primary hover:bg-red-800 hover:shadow-red-900/50 hover:-translate-y-1'
                : 'bg-gray-400 cursor-not-allowed opacity-70'}
          `}
          >
            MASUK
          </button>

          {claimMessage && (
            <div className={`mt-6 p-4 w-full max-w-sm text-center rounded-lg font-bold text-white animate-bounce-in shadow-lg ${claimMessage.includes('BERHASIL') ? 'bg-green-600' : 'bg-red-600'}`}>
              {claimMessage}
            </div>
          )}
        </div>

        {/* Kanan: Riwayat Angka & 3D Dendang (20%) */}
        <div className="lg:col-span-1 w-full flex flex-col gap-0 items-stretch lg:sticky lg:top-0 h-screen overflow-y-auto bg-black/20 border-l border-white/20 p-4">

          {/* Virtual Dendang 3D */}
          <div className="w-full">
            <VirtualDendang3D drawnNumber={lastDrawnNumber} />
            <p className="text-xs text-center text-gray-800 mt-2 font-serif italic font-bold drop-shadow-md">* Klik di mana saja untuk memulai musik latar</p>
          </div>

          {/* Riwayat Angka */}
          <div className="w-full bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 border-t-4 border-kim-primary flex-1 flex flex-col min-h-0">
            <h3 className="text-xl font-serif font-bold text-kim-primary mb-4 border-b pb-2 flex justify-between">
              <span>Riwayat Angka</span>
              <span className="text-sm font-sans font-normal text-gray-500 self-end mb-1">{drawnHistory.length} angka keluar</span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {drawnHistory.length === 0 ? (
                <div className="text-center text-gray-500 italic mt-10">Menunggu permainan dimulai...</div>
              ) : (
                drawnHistory.map((item, idx) => (
                  <div key={idx} className="bg-white/80 p-4 rounded-lg border border-gray-200 flex gap-4 items-center animate-fade-in shadow-sm">
                    <div className="flex-shrink-0 w-16 h-16 bg-kim-yellow text-kim-primary rounded-full flex items-center justify-center text-2xl font-bold font-mono shadow-inner border-2 border-dashed border-orange-300">
                      {item.number}
                    </div>
                    <div className="text-gray-800 italic font-serif flex-1 leading-relaxed text-lg font-medium">
                      "{item.pantun}"
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
