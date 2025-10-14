// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Overview from './views/Overview';
import Identities from './views/Identities';
import NetworkGraph from './views/NetworkGraph';
import TerraView from './views/TerraView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="identities" element={<Identities />} />
          <Route path="network" element={<NetworkGraph />} />
          <Route path="terra" element={<TerraView />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
