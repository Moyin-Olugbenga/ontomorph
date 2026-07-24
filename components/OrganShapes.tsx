'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface OrganShapeProps {
  size?: number;
}

// Custom heart shape
export function HeartGeometry({ size = 1 }: OrganShapeProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const s = size * 0.15;
    
    shape.moveTo(0, s * 2);
    shape.bezierCurveTo(-s * 2, s * 3, -s * 3, 0, 0, -s * 1.5);
    shape.bezierCurveTo(s * 3, 0, s * 2, s * 3, 0, s * 2);
    
    const extrudeSettings = {
      steps: 1,
      depth: size * 0.3,
      bevelEnabled: true,
      bevelThickness: size * 0.2,
      bevelSize: size * 0.1,
      bevelSegments: 8
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [size]);
  
  // @ts-ignore - geometry prop is valid for bufferGeometry
  return <bufferGeometry geometry={geometry} />;
}

// Custom bean shape (kidney)
export function BeanGeometry({ size = 1 }: OrganShapeProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const s = size * 0.15;
    
    // Create a bean-like shape
    shape.moveTo(0, s * 2);
    shape.bezierCurveTo(s * 2, s * 2.5, s * 2.5, s, s * 1.5, 0);
    shape.bezierCurveTo(s * 2.5, -s, s * 2, -s * 2.5, 0, -s * 2);
    shape.bezierCurveTo(-s * 2, -s * 2.5, -s * 2.5, -s, -s * 1.5, 0);
    shape.bezierCurveTo(-s * 2.5, s, -s * 2, s * 2.5, 0, s * 2);
    
    const extrudeSettings = {
      steps: 1,
      depth: size * 0.4,
      bevelEnabled: true,
      bevelThickness: size * 0.15,
      bevelSize: size * 0.08,
      bevelSegments: 8
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [size]);
  
  // @ts-ignore - geometry prop is valid for bufferGeometry
  return <bufferGeometry geometry={geometry} />;
}

// Custom brain shape
export function BrainGeometry({ size = 1 }: OrganShapeProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(size * 0.5, 32, 32);
    
    // Modify vertices to create brain-like folds
    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Add some bumpiness to simulate brain folds
      const noise = Math.sin(x * 8) * Math.cos(y * 6) * Math.sin(z * 7) * 0.08;
      const scale = 1 + noise;
      positions[i] *= scale;
      positions[i + 1] *= scale * 0.9;
      positions[i + 2] *= scale * 0.9;
    }
    
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    
    return geo;
  }, [size]);
  
  return <bufferGeometry {...(geometry as any)} />;
}

// Stomach (elongated sphere)
export function StomachGeometry({ size = 1 }: OrganShapeProps) {
  return <sphereGeometry args={[size * 0.5, 32, 32]} />;
}

// Intestines (torus with twists)
export function IntestinesGeometry({ size = 1 }: OrganShapeProps) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 40;
    const radius = size * 0.4;
    
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 4;
      const x = Math.sin(t) * radius * 0.8;
      const z = Math.cos(t) * radius * 0.6;
      const y = Math.sin(t * 1.5) * size * 0.2;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 60, size * 0.12, 8, false);
    return tubeGeometry;
  }, [size]);
  
  return <bufferGeometry {...(geometry as any)} />;
}

// Spine (simplified as cylinder)
export function SpineGeometry({ size = 1 }: OrganShapeProps) {
  return <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.9, 8]} />;
}