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
import Pago from './screens/Pago';   // Mudei para Pago (maiúsculo)
import Pago2 from './screens/Pago2'; // Mudei para Pago2 (maiúsculo)

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
          <Route path="/video-record" element={<VideoRecordPage />} />
          <Route path="/audiorecorder" element={<AudioRecordPage />} />
          <Route path="/admin/painel" element={<AdminDashboard />} />

          {/* ROTAS COM COMPONENTES MAIÚSCULOS */}
          <Route path="/Pago" element={<Pago />} />
          <Route path="/Pago2" element={<Pago2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
