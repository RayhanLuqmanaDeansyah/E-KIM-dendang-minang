"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Room {
  _id: string;
  roomName: string;
  status: string;
  currentColor: string;
  drawnNumbers: number[];
  createdAt: string;
}

export default function RoomsLobby() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await axios.get(`${API_URL}/api/v1/game/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(res.data);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-[85vh] bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-kim-primary mb-2">Lobby Permainan</h1>
          <p className="text-gray-500">Pilih ruangan (Room) yang tersedia dan mulai bermain KIM!</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kim-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 font-bold">Mencari ruangan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg">Belum ada room yang aktif. Menunggu Admin membuat room.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room._id} className="bg-white rounded-2xl shadow-md border-t-4 border-kim-primary overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">{room.roomName || `Room ${room._id.substring(0,6)}`}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-1">ID: {room._id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${room.status === 'PLAYING' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {room.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                      <div className="bg-gray-50 px-4 py-2 rounded-lg border">
                        <p className="text-xs text-gray-500 uppercase">Fase</p>
                        <p className="text-sm font-bold text-blue-700">{room.currentColor}</p>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-lg border">
                        <p className="text-xs text-gray-500 uppercase">Tarikan</p>
                        <p className="text-sm font-bold">{room.drawnNumbers.length}/90</p>
                      </div>
                    </div>

                    <Link 
                      href={`/play/${room._id}`}
                      className="block w-full text-center bg-kim-primary text-white font-bold py-3 rounded-xl hover:bg-red-800 transition-colors shadow-md active:scale-95"
                    >
                      JOIN ROOM
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
