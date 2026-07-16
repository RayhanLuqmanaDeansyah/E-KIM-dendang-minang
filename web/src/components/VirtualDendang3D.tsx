"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface VirtualDendangProps {
  drawnNumber: number | null;
}

function BambooTube({ isShaking }: { isShaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && isShaking) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.15;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.1 - 1;
    } else if (meshRef.current) {
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, -1, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1, 0]}>
      <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
      <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
    </mesh>
  );
}

function Coin({ number }: { number: number | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && number !== null) {
      const targetY = 1.5;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
      meshRef.current.rotation.y += 0.05;
      meshRef.current.rotation.x += 0.02;
    } else if (meshRef.current) {
      meshRef.current.position.y = -1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
      <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} />
    </mesh>
  );
}

export default function VirtualDendang3D({ drawnNumber }: VirtualDendangProps) {
  return (
    <div className="w-full h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-inner relative border-2 border-gray-700">
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-start pt-6">
        {drawnNumber !== null && (
          <span className="text-5xl font-black text-kim-yellow drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-bounce-in">
            {drawnNumber}
          </span>
        )}
      </div>
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FCE4EC" />
        
        <BambooTube isShaking={drawnNumber !== null} />
        <Coin number={drawnNumber} />
      </Canvas>
    </div>
  );
}
