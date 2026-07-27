import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Product } from '../types';
import { MachineBody } from './MachineBody';
import { ProductSlot } from './ProductSlot';

interface Props {
  products: Product[];
}

export function VendingMachineScene({ products }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 3, 3]} intensity={0.3} color="#4CAF50" />

        <MachineBody />

        {/* Product grid: 4 columns × 6 rows */}
        {products.map((product, index) => {
          const col = index % 4;
          const row = Math.floor(index / 4);
          const x = (col - 1.5) * 0.7;
          const y = (2.5 - row) * 0.55 - 0.2;
          return (
            <ProductSlot
              key={product.id}
              product={product}
              position={[x, y, 0.3]}
            />
          );
        })}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
          maxAzimuthAngle={Math.PI / 6}
          minAzimuthAngle={-Math.PI / 6}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
