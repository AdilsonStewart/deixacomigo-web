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
import Pago2 from './screens/Pago2';   // Para áudio
import Sucesso2 from './screens/Sucesso2'; // Para vídeo - você precisa criar este componente

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
          <Route path="/video-record" element={<VideoRecordPage />} /> {/* Alterado de '/videorecorder' para '/video-record' */}
          <Route path="/audiorecorder" element={<AudioRecordPage />} />
          <Route path="/admin/painel" element={<AdminDashboard />} />

          {/* ROTAS DE RETORNO DA CORA */}
          <Route path="/pago" element={<Pago2 />} />   // Para áudio
          <Route path="/sucesso2" element={<Sucesso2 />} /> // Para vídeo
        </Routes>
      </div>
    </Router>
  );
}

export default App;
