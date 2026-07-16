"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Room {
  _id: string;
  roomName: string;
  status: string;
  currentColor: string;
  drawnNumbers: number[];
  audioUrl?: string;
}

export default function AdminRoomConsole() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/game/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentRoom = res.data.find((r: Room) => r._id === roomId);
      if (currentRoom) setRoom(currentRoom);
    } catch (err) {
      console.error('Failed to fetch room', err);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'SUPER_ADMIN' && role !== 'OPERATOR') {
      alert('Akses ditolak! Halaman ini hanya untuk Admin.');
      router.push('/login');
      return;
    }

    fetchRoom();
    
    const token = localStorage.getItem('token') || '';
    const adminSocket = io(API_URL, { transports: ['websocket', 'polling'] });
    
    adminSocket.on('connect', () => {
      adminSocket.emit('JOIN_ROOM', { roomId, token });
    });

    adminSocket.on('ROOM_STATE_UPDATE', (data: any) => {
      setRoom(prev => prev ? { ...prev, ...data } : null);
      if (data.status === 'PAUSED' && audioRef.current) {
        audioRef.current.pause();
      }
    });

    adminSocket.on('NUMBER_DRAWN', (data: { number: number }) => {
      setRoom(prev => prev ? { ...prev, drawnNumbers: [...prev.drawnNumbers, data.number] } : null);
    });

    setSocket(adminSocket);

    return () => {
      adminSocket.disconnect();
    };
  }, [roomId]);

  const handleUpload = async () => {
    if (!audioFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('roomId', roomId);

      await axios.post(`${API_URL}/api/v1/game/upload-audio`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Berhasil upload lagu!');
      fetchRoom();
    } catch (err) {
      console.error(err);
      alert('Gagal upload lagu');
    } finally {
      setUploading(false);
    }
  };

  const handlePlay = () => {
    if (!audioRef.current || !socket) return;
    audioRef.current.play();
    const token = localStorage.getItem('token');
    socket.emit('ADMIN_AUDIO_SYNC', { roomId, token, action: 'PLAY', time: audioRef.current.currentTime });
    socket.emit('START_GAME', { roomId, token }); // ensure room is PLAYING
  };

  const handlePause = () => {
    if (!audioRef.current || !socket) return;
    audioRef.current.pause();
    const token = localStorage.getItem('token');
    socket.emit('ADMIN_AUDIO_SYNC', { roomId, token, action: 'PAUSE', time: audioRef.current.currentTime });
    socket.emit('PAUSE_GAME', { roomId, token }); // ensure room is PAUSED
  };

  const drawNumber = (num: number) => {
    if (!socket || !room) return;
    if (room.status !== 'PLAYING') {
      alert('Mainkan musik (PLAY) terlebih dahulu sebelum menarik angka!');
      return;
    }
    const token = localStorage.getItem('token');
    socket.emit('ADMIN_DRAW_NUMBER', { roomId, token, number: num });
  };

  if (!room) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 mb-4 hover:underline">
          &larr; Kembali ke Dashboard
        </button>
        
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-kim-primary">Game Master Console</h1>
          <p className="text-gray-500">Room ID: {roomId} | Status: <strong className={room.status === 'PLAYING' ? 'text-green-600' : 'text-orange-600'}>{room.status}</strong></p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kiri: Audio Control & Info */}
          <div className="col-span-1 space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-4">1. Upload Lagu Minang</h3>
              {!room.audioUrl ? (
                <div className="space-y-3">
                  <input type="file" accept="audio/mp3,audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} className="text-sm w-full border p-2 rounded" />
                  <button onClick={handleUpload} disabled={uploading || !audioFile} className="bg-blue-600 text-white px-4 py-2 rounded font-bold w-full disabled:bg-gray-400">
                    {uploading ? 'Mengunggah...' : 'Upload & Siap Main'}
                  </button>
                  {room.status === 'WAITING' && (
                    <button onClick={() => socket?.emit('START_GAME', { roomId, token: localStorage.getItem('token') })} className="bg-orange-500 text-white px-4 py-2 rounded font-bold w-full mt-2">
                      Mulai Tanpa Lagu (Testing)
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-green-600 font-bold flex items-center gap-2">
                  <span>✓</span> Lagu sudah terpasang
                </div>
              )}
            </div>

            {/* Statistik Tarikan now takes full height if audio is moved */}
            <div className="bg-kim-primary/10 p-4 rounded-xl border border-kim-primary/20">
              <h3 className="font-bold text-kim-primary mb-2">Statistik Tarikan</h3>
              <p className="text-4xl font-black">{(room.drawnNumbers || []).length} <span className="text-sm font-normal text-gray-700">/ 90</span></p>
            </div>
          </div>

          {/* Kanan: 90 Numbers Grid */}
          <div className="col-span-1 lg:col-span-2 pb-32">
            <h3 className="font-bold mb-4 text-xl">3. Papan Angka (Klik saat disebut di lagu)</h3>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 90 }, (_, i) => i + 1).map(num => {
                const isDrawn = (room.drawnNumbers || []).includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => drawNumber(num)}
                    disabled={isDrawn}
                    className={`
                      h-10 md:h-12 rounded flex items-center justify-center font-bold text-base transition-all
                      ${isDrawn ? 'bg-gray-800 text-white opacity-50 cursor-not-allowed' : 'bg-kim-yellow text-kim-primary hover:bg-orange-300 hover:scale-105 active:scale-95 shadow border-b-2 border-orange-500'}
                    `}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM AUDIO CONTROLS (Spotify-like) */}
      {room.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 text-white shadow-2xl z-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-bold text-kim-yellow">Sedang Dimainkan</p>
            <p className="text-xs text-gray-400 truncate">{room.audioUrl.split('/').pop()}</p>
          </div>
          
          <div className="flex-1 w-full max-w-2xl flex flex-col items-center gap-2">
            <div className="flex gap-4">
              <button onClick={handlePlay} className="bg-green-500 hover:bg-green-400 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-105 active:scale-95" title="Play (Sync to Players)">
                ▶
              </button>
              <button onClick={handlePause} className="bg-orange-500 hover:bg-orange-400 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-105 active:scale-95" title="Pause (Sync to Players)">
                ⏸
              </button>
            </div>
            <audio ref={audioRef} src={API_URL + room.audioUrl} controls className="w-full h-8 opacity-80 contrast-125" />
          </div>
          
          <div className="flex-1 hidden md:flex justify-end text-xs text-gray-400">
            Game Master Audio Sync
          </div>
        </div>
      )}
    </div>
  );
}
