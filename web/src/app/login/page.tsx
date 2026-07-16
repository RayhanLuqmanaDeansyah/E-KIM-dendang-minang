"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/login`, { username, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);

      if (res.data.role === 'SUPER_ADMIN' || res.data.role === 'OPERATOR') {
        router.push('/admin/dashboard');
      } else {
        router.push('/rooms');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (type: 'admin' | 'player') => {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername(`player${Math.floor(Math.random() * 1000)}`);
      setPassword('player123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-kim-primary p-6 text-center">
          <h2 className="text-3xl font-serif font-bold text-white tracking-widest">KIM</h2>
          <p className="text-kim-pink/80 text-sm mt-1">Masuk ke Arena Permainan</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-kim-primary outline-none transition-all"
                placeholder="Masukkan username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-kim-primary outline-none transition-all"
                placeholder="Masukkan password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-kim-primary text-white font-bold py-4 rounded-xl hover:bg-red-800 transition-colors shadow-lg active:scale-95"
            >
              {loading ? 'Memproses...' : 'MULAI BERMAIN'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 mb-4 uppercase tracking-wider font-bold">Quick Login (Developer Mode)</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => autofill('admin')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold transition-colors"
              >
                Isi sbg Admin
              </button>
              <button 
                type="button"
                onClick={() => autofill('player')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-bold transition-colors"
              >
                Isi sbg Pemain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
