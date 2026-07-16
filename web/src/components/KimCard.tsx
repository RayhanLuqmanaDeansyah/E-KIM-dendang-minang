"use client";
import React, { useState } from 'react';

const MOCK_GRID: Array<Array<number | null>> = [
  [8, null, 25, 34, null, 56, null, 77, null],
  [null, 15, 27, null, 42, null, 68, 79, null],
  [4, 19, null, 38, null, 59, null, null, 83],
  [null, null, 29, 39, 45, null, 69, null, 88],
  [9, 11, null, null, 48, null, null, 72, 89],
  [null, 18, null, null, 49, 53, 62, null, 90]
];

interface KimCardProps {
  colorPhase?: 'pink' | 'yellow' | 'blue' | 'green' | 'white';
  grid?: Array<Array<number | null>>;
  isTorn?: boolean;
  daubs?: Set<string>;
  onToggleDaub?: (rIndex: number, cIndex: number, cell: number | null) => void;
}

export default function KimCard({ 
  colorPhase = 'pink', 
  grid = MOCK_GRID, 
  isTorn = false,
  daubs = new Set(),
  onToggleDaub
}: KimCardProps) {
  const toggleDaub = (rIndex: number, cIndex: number, cell: number | null) => {
    if (cell === null || isTorn) return;
    if (onToggleDaub) {
      onToggleDaub(rIndex, cIndex, cell);
    }
  };

  const colorMap = {
    pink: 'bg-pink-200',
    yellow: 'bg-yellow-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    white: 'bg-white',
  };

  return (
    <div className={`w-full relative shadow-2xl overflow-hidden border-2 border-gray-400 mx-auto max-w-[min(100%,130vh)] transition-all duration-700 ${isTorn ? 'grayscale opacity-75 rotate-2 scale-95' : ''}`}>
      {isTorn && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-red-600 text-white font-bold text-4xl md:text-6xl py-6 px-12 transform -rotate-12 border-4 border-white shadow-2xl rounded">
            DISKUALIFIKASI
          </div>
        </div>
      )}

      <div className={`p-3 md:p-6 ${colorMap[colorPhase]} transition-colors duration-500 flex flex-row items-stretch min-h-[500px]`}>
        {/* Left column text */}
        <div className={`w-20 md:w-32 border-2 border-black ${colorMap[colorPhase]} flex flex-col justify-between items-center mr-3 shadow-inner`}>
          <div 
            className="rotate-180 flex-1 flex items-center justify-center text-center p-3 border-b-2 border-black w-full"
            style={{ writingMode: 'vertical-rl' }}
          >
            <span className="text-[14px] md:text-[18px] font-sans font-bold leading-tight">Dendang Pantun<br/>dan Lagu Berhadiah<br/>"KIM rayhan"</span>
          </div>
          <div className="h-24 md:h-32 flex items-center justify-center w-full">
            <span className="transform -rotate-90 text-3xl md:text-5xl font-bold font-sans tracking-widest text-black">D31</span>
          </div>
        </div>

        {/* Right column (The 2 grids) */}
        <div className={`flex-1 flex flex-col justify-between ${colorMap[colorPhase]} border-2 border-black p-2 shadow-inner`}>
          {/* Top 3 rows */}
          <div className="w-full">
            <div className="grid grid-cols-9 w-full border-t-2 border-l-2 border-black bg-transparent">
              {grid.slice(0, 3).map((row, rIndex) => (
                row.map((cell, cIndex) => {
                  const absoluteRow = 0 + rIndex;
                  const key = `${absoluteRow}-${cIndex}`;
                  const isDaubed = daubs.has(key);
                  return (
                    <div 
                      key={key} 
                      onClick={() => toggleDaub(absoluteRow, cIndex, cell)}
                      className={`
                        relative flex items-center justify-center 
                        border-r-2 border-b-2 border-black aspect-square
                        text-xl md:text-3xl font-black select-none
                        ${cell === null ? 'bg-transparent' : `bg-black/5 hover:bg-black/15 cursor-pointer`}
                      `}
                    >
                      {cell !== null && <span className="text-black z-10 font-sans drop-shadow-md">{cell}</span>}
                      {isDaubed && (
                        <div className="absolute inset-0 m-auto w-full h-full flex items-center justify-center z-20 pointer-events-none">
                           <div className="w-12 h-12 rounded-full border-4 border-red-600 opacity-80 animate-bounce-in flex items-center justify-center">
                             <div className="w-1.5 h-12 bg-red-600 rotate-45 absolute"></div>
                             <div className="w-1.5 h-12 bg-red-600 -rotate-45 absolute"></div>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
          
          {/* Middle Text */}
          <div className="py-2 text-center w-full">
            <p className="text-sm md:text-lg font-sans font-bold text-black tracking-widest">Kesenian Irama Minang "KIM"</p>
          </div>

          {/* Bottom 3 rows */}
          <div className="w-full">
            <div className="grid grid-cols-9 w-full border-t-2 border-l-2 border-black bg-transparent">
              {grid.slice(3, 6).map((row, rIndex) => (
                row.map((cell, cIndex) => {
                  const absoluteRow = 3 + rIndex;
                  const key = `${absoluteRow}-${cIndex}`;
                  const isDaubed = daubs.has(key);
                  return (
                    <div 
                      key={key} 
                      onClick={() => toggleDaub(absoluteRow, cIndex, cell)}
                      className={`
                        relative flex items-center justify-center 
                        border-r-2 border-b-2 border-black aspect-square
                        text-xl md:text-3xl font-black select-none
                        ${cell === null ? 'bg-transparent' : `bg-black/5 hover:bg-black/15 cursor-pointer`}
                      `}
                    >
                      {cell !== null && <span className="text-black z-10 font-sans drop-shadow-md">{cell}</span>}
                      {isDaubed && (
                        <div className="absolute inset-0 m-auto w-full h-full flex items-center justify-center z-20 pointer-events-none">
                           <div className="w-12 h-12 rounded-full border-4 border-red-600 opacity-80 animate-bounce-in flex items-center justify-center">
                             <div className="w-1.5 h-12 bg-red-600 rotate-45 absolute"></div>
                             <div className="w-1.5 h-12 bg-red-600 -rotate-45 absolute"></div>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
