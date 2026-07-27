import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LaptopApp } from './laptop/LaptopApp';
import { MobileApp } from './mobile/MobileApp';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LaptopApp />} />
        <Route path="/mobile" element={<MobileApp />} />
      </Routes>
    </BrowserRouter>
  );
}
