'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { OrganHealth } from '@/app/types';
import { ORGAN_STATUS_COLORS } from '@/lib/organs.config';

interface ThreeViewerProps {
  organs: OrganHealth[];
  onOrganClick?: (organ: OrganHealth) => void;
}

function OrganMesh({ organ, onClick }: { organ: OrganHealth; onClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const color = ORGAN_STATUS_COLORS[organ.status];
  
  // Pulsing animation for affected organs
  useFrame(({ clock }) => {
    if (meshRef.current) {
      if (organ.status === 'affected') {
        const pulse = Math.sin(clock.getElapsedTime() * 3) * 0.05 + 1;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
      if (isHovered) {
        const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
        meshRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  // Build organ geometry based on type
  const buildOrgan = () => {
    const size = organ.size * 0.6;
    
    switch (organ.id) {
      case 'brain':
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={[size * 0.9, 32, 32]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.4}
              metalness={0.05}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.85 : 1}
            />
          </mesh>
        );
      
      case 'heart':
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={[size * 0.8, 32, 32]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.3}
              metalness={0.1}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.85 : 1}
            />
          </mesh>
        );
      
      case 'lungs':
        return (
          <group>
            {/* Left lung */}
            <mesh position={[-size * 0.5, 0, 0]} ref={meshRef}>
              <capsuleGeometry args={[size * 0.35, size * 0.6, 8, 16]} />
              <meshStandardMaterial 
                color={color}
                roughness={0.3}
                metalness={0.1}
                emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
                emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
                transparent
                opacity={organ.status === 'healthy' ? 0.85 : 1}
              />
            </mesh>
            {/* Right lung */}
            <mesh position={[size * 0.5, 0, 0]}>
              <capsuleGeometry args={[size * 0.35, size * 0.6, 8, 16]} />
              <meshStandardMaterial 
                color={color}
                roughness={0.3}
                metalness={0.1}
                emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
                emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
                transparent
                opacity={organ.status === 'healthy' ? 0.85 : 1}
              />
            </mesh>
          </group>
        );
      
      case 'liver':
        return (
          <mesh ref={meshRef} scale={[1.3, 0.6, 0.8]}>
            <sphereGeometry args={[size * 0.8, 32, 32]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.3}
              metalness={0.1}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.85 : 1}
            />
          </mesh>
        );
      
      case 'stomach':
        return (
          <mesh ref={meshRef} scale={[0.8, 1.2, 0.7]}>
            <sphereGeometry args={[size * 0.7, 32, 32]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.3}
              metalness={0.1}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.85 : 1}
            />
          </mesh>
        );
      
      case 'kidneys':
        return (
          <group>
            <mesh position={[-size * 0.4, 0, 0]} ref={meshRef} scale={[0.8, 1, 0.6]}>
              <sphereGeometry args={[size * 0.5, 32, 32]} />
              <meshStandardMaterial 
                color={color}
                roughness={0.3}
                metalness={0.1}
                emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
                emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
                transparent
                opacity={organ.status === 'healthy' ? 0.85 : 1}
              />
            </mesh>
            <mesh position={[size * 0.4, 0, 0]} scale={[0.8, 1, 0.6]}>
              <sphereGeometry args={[size * 0.5, 32, 32]} />
              <meshStandardMaterial 
                color={color}
                roughness={0.3}
                metalness={0.1}
                emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
                emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
                transparent
                opacity={organ.status === 'healthy' ? 0.85 : 1}
              />
            </mesh>
          </group>
        );
      
      case 'intestines':
        return (
          <mesh ref={meshRef} scale={[1.5, 0.6, 0.8]}>
            <torusKnotGeometry args={[size * 0.5, size * 0.2, 40, 8]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.4}
              metalness={0.05}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.85 : 1}
            />
          </mesh>
        );
      
      case 'spine':
        return (
          <mesh ref={meshRef} scale={[0.2, 1.8, 0.2]}>
            <cylinderGeometry args={[size * 0.3, size * 0.3, size * 1.5, 8]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.5}
              metalness={0.05}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.9 : 1}
            />
          </mesh>
        );
      
      default:
        return (
          <mesh ref={meshRef}>
            <sphereGeometry args={[size * 0.6, 32, 32]} />
            <meshStandardMaterial 
              color={color}
              roughness={0.3}
              metalness={0.1}
              emissive={organ.status === 'affected' ? '#ff0000' : '#000000'}
              emissiveIntensity={organ.status === 'affected' ? 0.2 : 0}
              transparent
              opacity={organ.status === 'healthy' ? 0.85 : 1}
            />
          </mesh>
        );
    }
  };

  return (
    <group position={organ.position}>
      <Float
        speed={organ.status === 'affected' ? 1.5 : 0.5}
        rotationIntensity={0.05}
        floatIntensity={organ.status === 'affected' ? 0.15 : 0.03}
      >
        <group
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          onPointerOver={() => {
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          {buildOrgan()}
        </group>
      </Float>
      
      {/* Organ label */}
      <Text
        position={[0, organ.size * 0.9, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        fontWeight="bold"
      >
        {organ.name}
      </Text>
    </group>
  );
}

export function ThreeViewer({ organs, onOrganClick }: ThreeViewerProps) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 relative">
      <Canvas camera={{ position: [0, 0.5, 8] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <spotLight position={[0, 8, 4]} intensity={0.5} />
        
        <OrbitControls 
          enablePan={true}
          minDistance={3}
          maxDistance={15}
          autoRotate
          autoRotateSpeed={0.2}
          enableDamping
          dampingFactor={0.05}
          target={[0, 0.3, 0]}
        />
        
        {/* Body silhouette */}
        <mesh position={[0, 0.3, 0]} scale={[0.9, 1.1, 0.4]}>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshStandardMaterial 
            color="#4a4a5a" 
            transparent 
            opacity={0.08}
            wireframe
          />
        </mesh>
        
        {organs.map((organ) => (
          <OrganMesh
            key={organ.id}
            organ={organ}
            onClick={() => onOrganClick?.(organ)}
          />
        ))}
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Affected</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        🖱 Click or tap any organ
      </div>
    </div>
  );
}