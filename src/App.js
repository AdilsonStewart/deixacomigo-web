import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Servicos from './screens/Servicos';
import Sucesso from './screens/Sucesso';
import Erro from './screens/Erro';
import AudioRecordPage from './screens/AudioRecordPage'; // ← NOME CORRETO AGORA!
import Agendamento from './screens/Agendamento';
import Saida from './screens/Saida';
import VideoRecordPage from './screens/VideoRecordPage';
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
          <Route path="/videorecorder" element={<VideoRecordPage />} />
          <Route path="/audiorecorder" element={<AudioRecordPage />} /> {/* ← Corrigido! */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
