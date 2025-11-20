import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// IMPORTS DAS TELAS
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Servicos from './screens/Servicos';
import Sucesso from './screens/Sucesso';
import Erro from './screens/Erro';
import AudioRecordPage from './screens/AudioRecordPage';
import Agendamento from './screens/Agendamento';
import Saida from './screens/Saida';
import VideoRecordPage from './screens/VideoRecordPage';
import AdminDashboard from './screens/AdminDashboard';
import Sucesso2 from './screens/Sucesso2';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/sucesso" element={<Sucesso />} />
          <Route path="/erro" element={<Erro />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/saida" element={<Saida />} />

          {/* GRAVADOR DE VÍDEO */}
          <Route path="/videorecorder" element={<VideoRecordPage />} />

          {/* GRAVADOR DE ÁUDIO */}
          <Route path="/audiorecorder" element={<AudioRecordPage />} />

          {/* ADM */}
          <Route path="/admin/painel" element={<AdminDashboard />} />

          {/* SUCESSO DO PAGAMENTO QUE VAI PARA VÍDEO */}
          <Route path="/sucesso2" element={<Sucesso2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
