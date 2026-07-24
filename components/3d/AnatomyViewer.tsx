// 'use client';

// import React, { useRef, useState } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
// import * as THREE from 'three';
// import { OrganDetail } from '@/components/ExplanationPanel';

// interface ModelProps {
//   modelUrl: string;
//   highlightedOrgans: OrganDetail[];
//   selectedOrganId: string | null;
//   onSelectOrgan: (organ: OrganDetail | null) => void;
// }

// function AnatomyModel({ modelUrl, highlightedOrgans, selectedOrganId, onSelectOrgan }: ModelProps) {
//   // Load standard GLTF model
//   const { scene } = useGLTF(modelUrl);

//   // Traverse model nodes and clone materials to apply highlights
//   scene.traverse((child) => {
//     if ((child as THREE.Mesh).isMesh) {
//       const mesh = child as THREE.Mesh;
//       const highlightInfo = highlightedOrgans.find(
//         (o) => o.meshName === mesh.name || `mesh_${o.organId}` === mesh.name
//       );

//       if (highlightInfo) {
//         // Create an emissive highlighted material for target organs
//         const isSelected = selectedOrganId === highlightInfo.organId;
//         mesh.material = new THREE.MeshStandardMaterial({
//           color: highlightInfo.colorHex || '#EF4444',
//           emissive: new THREE.Color(highlightInfo.colorHex || '#EF4444'),
//           emissiveIntensity: isSelected ? 0.9 : 0.5,
//           roughness: 0.3,
//           metalness: 0.1,
//         });
//       } else {
//         // Subdued translucent material for body structures
//         mesh.material = new THREE.MeshStandardMaterial({
//           color: '#334155',
//           transparent: true,
//           opacity: 0.25,
//           wireframe: false,
//         });
//       }
//     }
//   });

//   return (
//     <primitive
//       object={scene}
//       onClick={(e: any) => {
//         e.stopPropagation();
//         const clickedMeshName = e.object.name;
//         const matchedOrgan = highlightedOrgans.find(
//           (o) => o.meshName === clickedMeshName || `mesh_${o.organId}` === clickedMeshName
//         );
//         onSelectOrgan(matchedOrgan || null);
//       }}
//     />
//   );
// }

// export default function AnatomyViewer({
//   modelUrl = '/models/human_anatomy_dummy.glb',
//   highlightedOrgans,
//   selectedOrganId,
//   onSelectOrgan,
// }: {
//   modelUrl?: string;
//   highlightedOrgans: OrganDetail[];
//   selectedOrganId: string | null;
//   onSelectOrgan: (organ: OrganDetail | null) => void;
// }) {
//   return (
//     <div className="relative w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
//       <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[10, 10, 10]} intensity={1.2} />
//         <Stage environment="city" intensity={0.5}>
//           <AnatomyModel
//             modelUrl={modelUrl}
//             highlightedOrgans={highlightedOrgans}
//             selectedOrganId={selectedOrganId}
//             onSelectOrgan={onSelectOrgan}
//           />
//         </Stage>
//         <OrbitControls makeDefault enablePan enableZoom minDistance={1.5} maxDistance={10} />
//       </Canvas>

//       {/* Helper Overlay */}
//       <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-md text-xs text-slate-300">
//         💡 Drag to rotate | Scroll to zoom | Click highlighted organ to inspect
//       </div>
//     </div>
//   );
// }


'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { OrganDetail } from '@/app/types';

interface AnatomyViewerProps {
  highlightedOrgans: OrganDetail[];
  selectedOrganId: string | null;
  onSelectOrgan: (organ: OrganDetail | null) => void;
}

function ProceduralAnatomyBody({ highlightedOrgans, selectedOrganId, onSelectOrgan }: AnatomyViewerProps) {
  // Define procedural node mapping for organs
  const organNodes = [
    { id: 'heart', meshName: 'mesh_heart', pos: [0, 0.6, 0.1], scale: [0.25, 0.25, 0.25] },
    { id: 'lungs', meshName: 'mesh_lungs', pos: [0, 0.7, -0.05], scale: [0.6, 0.45, 0.3] },
    { id: 'liver', meshName: 'mesh_liver', pos: [-0.25, 0.2, 0.1], scale: [0.4, 0.25, 0.3] },
    { id: 'gallbladder', meshName: 'mesh_gallbladder', pos: [-0.2, 0.05, 0.15], scale: [0.15, 0.15, 0.15] },
    { id: 'stomach', meshName: 'mesh_stomach', pos: [0.2, 0.2, 0.1], scale: [0.3, 0.25, 0.25] },
    { id: 'kidney_left', meshName: 'mesh_kidney_left', pos: [0.25, -0.1, -0.1], scale: [0.18, 0.22, 0.18] },
    { id: 'kidney_right', meshName: 'mesh_kidney_right', pos: [-0.25, -0.1, -0.1], scale: [0.18, 0.22, 0.18] },
  ];

  return (
    <group>
      {/* Translucent Base Body Frame */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.7, 1.8, 16, 32]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.25} wireframe />
      </mesh>

      {/* Anatomical Organ Nodes */}
      {organNodes.map((node) => {
        const highlightInfo = highlightedOrgans.find(
          (o) => o.organId === node.id || o.meshName === node.meshName
        );
        const isSelected = selectedOrganId === node.id;
        const colorHex = highlightInfo ? highlightInfo.colorHex || '#EF4444' : '#334155';

        return (
          <mesh
            key={node.id}
            position={node.pos as [number, number, number]}
            scale={node.scale as [number, number, number]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOrgan(highlightInfo || null);
            }}
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={colorHex}
              emissive={highlightInfo ? new THREE.Color(colorHex) : new THREE.Color('#000000')}
              emissiveIntensity={isSelected ? 0.9 : highlightInfo ? 0.5 : 0}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function AnatomyViewer({
  highlightedOrgans,
  selectedOrganId,
  onSelectOrgan,
}: AnatomyViewerProps) {
  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <Stage environment="city" intensity={0.5}>
          <ProceduralAnatomyBody
            highlightedOrgans={highlightedOrgans}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={onSelectOrgan}
          />
        </Stage>
        <OrbitControls makeDefault enablePan enableZoom minDistance={1.5} maxDistance={8} />
      </Canvas>

      {/* Helper Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-md text-xs text-slate-300">
        💡 Drag to rotate | Scroll to zoom | Click highlighted organ to inspect
      </div>
    </div>
  );
}
