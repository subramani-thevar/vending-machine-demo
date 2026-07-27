import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { RoundedBox } from '@react-three/drei';

export function MachineBody() {
  const glassRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (glassRef.current) {
      // Subtle breathing animation
      glassRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group>
      {/* Machine frame */}
      <RoundedBox args={[3.5, 4, 0.8]} radius={0.05} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Glass panel */}
      <mesh ref={glassRef} position={[0, 0, 0.35]}>
        <boxGeometry args={[3.2, 3.7, 0.05]} />
        <meshPhysicalMaterial
          color="#88ccff"
          transparent
          opacity={0.15}
          metalness={0.1}
          roughness={0}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Shelves */}
      {[1.6, 0.9, 0.2, -0.5, -1.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.1]}>
          <boxGeometry args={[3.2, 0.03, 0.5]} />
          <meshStandardMaterial color="#333355" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Top label */}
      <mesh position={[0, 2.1, 0.41]}>
        <planeGeometry args={[2.5, 0.3]} />
        <meshBasicMaterial color="#4CAF50" />
      </mesh>
    </group>
  );
}
