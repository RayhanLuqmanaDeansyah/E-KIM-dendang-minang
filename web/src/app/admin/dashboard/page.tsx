"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Room {
  _id: string;
  roomName: string;
  status: string;
  currentColor: string;
  drawnNumbers: number[];
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePlayers, setActivePlayers] = useState(0); // Mocking active players for now

  // We assume admin is logged in and token is in localStorage
  const getAuthHeaders = () => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem('token') || 'dummy-admin-token'}` } };
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/game/rooms`, getAuthHeaders());
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'SUPER_ADMIN' && role !== 'OPERATOR') {
      alert('Akses ditolak! Halaman ini hanya untuk Admin.');
      router.push('/login');
      return;
    }

    fetchRooms();
    
    // Connect Admin socket for real-time player monitor
    const adminSocket = io(API_URL, { transports: ['websocket'] });
    adminSocket.on('connect', () => {
       // Mock joining admin room
       adminSocket.emit('JOIN_ADMIN_ROOM');
    });
    
    // Mock event for active players
    adminSocket.on('ACTIVE_PLAYERS_UPDATE', (count: number) => {
       setActivePlayers(count);
    });

    setSocket(adminSocket);

    return () => {
      adminSocket.disconnect();
    };
  }, []);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/game/room`, { maxPlayers: 100 }, getAuthHeaders());
      fetchRooms();
    } catch (err) {
      console.error('Failed to create room', err);
      alert('Gagal membuat room. Pastikan Anda login sebagai Admin.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomStatus = (roomId: string, currentStatus: string) => {
    if (!socket) return;
    const token = localStorage.getItem('token');
    
    if (currentStatus === 'WAITING' || currentStatus === 'PAUSED') {
      socket.emit('START_GAME', { roomId, token });
      // Optimistic UI update
      setRooms(rooms.map(r => r._id === roomId ? { ...r, status: 'PLAYING' } : r));
    } else {
      socket.emit('PAUSE_GAME', { roomId, token });
      setRooms(rooms.map(r => r._id === roomId ? { ...r, status: 'PAUSED' } : r));
    }
  };

  const changeInterval = (roomId: string, intervalSeconds: number) => {
    if (!socket) return;
    socket.emit('ADMIN_SET_INTERVAL', { roomId, interval: intervalSeconds * 1000 });
    alert(`Interval diubah menjadi ${intervalSeconds} detik`);
  };

  const exportPDF = (room: Room) => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Laporan Hasil Permainan KIM', 14, 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Room ID: ${room._id}`, 14, 32);
    doc.text(`Status Terakhir: ${room.status}`, 14, 40);
    doc.text(`Fase Warna Terakhir: ${room.currentColor}`, 14, 48);
    doc.text(`Waktu Dibuat: ${new Date(room.createdAt).toLocaleString('id-ID')}`, 14, 56);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Angka Keluar: ${room.drawnNumbers.length}`, 14, 70);
    
    // AutoTable for drawn numbers
    const tableData = room.drawnNumbers.map((num, idx) => [idx + 1, num]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Urutan', 'Angka yang Keluar']],
      body: tableData,
      theme: 'grid',
      styles: { halign: 'center' },
      headStyles: { fillColor: [183, 28, 28] } // kim-primary
    });
    
    doc.save(`KIM-Report-${room._id}.pdf`);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus room ini? Data tidak bisa dikembalikan.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/v1/game/room/${roomId}`, getAuthHeaders());
      alert('Room berhasil dihapus');
      fetchRooms();
    } catch (err) {
      console.error('Failed to delete room', err);
      alert('Gagal menghapus room.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-serif font-bold text-kim-primary">Admin Dashboard</h1>
            <p className="text-gray-500">KIM Minangkabau Tournament System</p>
          </div>
          
          <div className="flex gap-6 items-center">
            <div className="bg-kim-primary/10 px-6 py-3 rounded-xl border border-kim-primary/20 text-center">
              <p className="text-xs font-bold text-kim-primary uppercase tracking-wider mb-1">Live Players</p>
              <p className="text-2xl font-mono font-black text-gray-800">{activePlayers}</p>
            </div>
            
            <button 
              onClick={handleCreateRoom}
              disabled={loading}
              className="bg-kim-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-800 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
            >
              {loading ? 'Creating...' : '+ Buat Room Baru'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {rooms.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-lg">Belum ada room yang aktif.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                  <div>
                    <h3 className="font-mono text-sm text-gray-500">ID: {room._id}</h3>
                    <p className="text-xs text-gray-400">{new Date(room.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${room.status === 'PLAYING' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {room.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      FASE {room.currentColor}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex gap-4 items-center flex-1">
                    <div className="text-center px-6 py-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs text-gray-500 uppercase">Tarikan</p>
                      <p className="text-xl font-mono font-bold">{room.drawnNumbers.length}/90</p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 font-bold">Ubah Interval (Detik)</label>
                      <select 
                        onChange={(e) => changeInterval(room._id, parseInt(e.target.value))}
                        className="border rounded-md px-3 py-2 text-sm bg-white"
                        defaultValue="10"
                      >
                        <option value="5">5 Detik (Cepat)</option>
                        <option value="10">10 Detik (Normal)</option>
                        <option value="15">15 Detik (Lambat)</option>
                        <option value="0">Manual (Klik Tukang Dendang)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/admin/room/${room._id}`)}
                      className="px-6 py-2 rounded-lg font-bold text-sm text-white transition-colors bg-kim-primary hover:bg-red-800"
                    >
                      MASUK ROOM
                    </button>
                    
                    <button
                      onClick={() => exportPDF(room)}
                      className="px-6 py-2 rounded-lg font-bold text-sm bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                    >
                      EXPORT PDF
                    </button>
                    
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="px-6 py-2 rounded-lg font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200"
                    >
                      HAPUS ROOM
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
