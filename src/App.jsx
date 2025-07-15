// src/App.jsx
import { useState } from 'react'
import './App.css'
import { AppProvider } from './context/AppContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Messages from './pages/messages/Messages';
import Settings from './pages/settings/Settings';
import Stats from './pages/stats/Stats';
import Factures from './pages/factures/Factures';
import Devis from './pages/devis/Devis';
import NewMessageNotification from './components/common/NewMessageNotification';

function App() {
  return (
    <AppProvider>
      <WebSocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="stats" element={<Stats />} />
              <Route path="factures" element={<Factures />} />
              <Route path="messages" element={<Messages />} />
              <Route path="devis" element={<Devis />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        
        {/* Global notification component */}
        <NewMessageNotification />
      </WebSocketProvider>
    </AppProvider>
  )
}

export default App