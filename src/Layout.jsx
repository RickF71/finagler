// src/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

export default function Layout() {
  return (
  <div className="flex min-h-screen text-slate-100 bg-transparent">
    <Sidebar />
    <main className="flex-1 p-6 overflow-auto">
      <Outlet />
    </main>
  </div>
  );
}
