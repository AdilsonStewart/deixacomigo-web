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
import pago from './screens/pago';   // Para áudio - minúsculo
import pago2 from './screens/pago2'; // Para vídeo - minúsculo

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

          {/* ROTAS DE RETORNO DA CORA - APENAS PAGO E PAGO2 */}
          <Route path="/pago" element={<pago />} />     {/* Para áudio */}
          <Route path="/pago2" element={<pago2 />} />   {/* Para vídeo */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
