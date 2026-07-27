import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { Product, CATEGORY_COLORS } from '../types';

interface Props {
  product: Product;
  position: [number, number, number];
}

export function ProductSlot({ product, position }: Props) {
  const meshRef = useRef<Mesh>(null);
  const [opacity, setOpacity] = useState(1);
  const prevStatus = useRef(product.status);

  // Animate opacity transition on status change
  useEffect(() => {
    if (prevStatus.current === 'available' && product.status === 'sold_out') {
      // Animate to sold out
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / 300, 1);
        setOpacity(1 - progress * 0.5);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    } else if (product.status === 'available') {
      setOpacity(1);
    }
    prevStatus.current = product.status;
  }, [product.status]);

  useFrame((state) => {
    if (meshRef.current && product.status === 'available') {
      // Subtle floating animation for available products
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0] * 3) * 0.01;
    }
  });

  const color = CATEGORY_COLORS[product.category];
  const isSoldOut = product.status === 'sold_out';

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.4, 0.3]} />
        <meshStandardMaterial
          color={isSoldOut ? '#555555' : color}
          transparent
          opacity={opacity}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Product name */}
      <Text
        position={[0, -0.25, 0.2]}
        fontSize={0.06}
        color={isSoldOut ? '#888888' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.6}
      >
        {product.name}
      </Text>

      {/* Sold out overlay */}
      {isSoldOut && (
        <Text
          position={[0, 0.05, 0.2]}
          fontSize={0.08}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          SOLD OUT
        </Text>
      )}
    </group>
  );
}
