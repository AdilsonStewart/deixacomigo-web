import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Servicos from './screens/Servicos';
import Erro from './screens/Erro';
import AudioRecordPage from './screens/AudioRecordPage';
import Agendamento from './screens/Agendamento';
import Saida from './screens/Saida';
import VideoRecordPage from './screens/VideoRecordPage';
import AdminDashboard from './screens/AdminDashboard';

// APENAS AS PÁGINAS QUE VOCÊ QUER MANTER
import Pago2 from './screens/Pago2';   // ← esse arquivo você já tem e funciona

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/erro" element={<Erro />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/saida" element={<Saida />} />
          <Route path="/videorecorder" element={<VideoRecordPage />} />
          <Route path="/audiorecorder" element={<AudioRecordPage />} />
          <Route path="/admin/painel" element={<AdminDashboard />} />

          {/* ROTAS NOVAS E DEFINITIVAS DA CORA */}
          <Route path="/pago" element={<Pago2 />} />
          <Route path="/pago/" element={<Pago2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
