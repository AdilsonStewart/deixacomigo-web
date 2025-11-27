import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// TODAS AS TELAS QUE JÁ EXISTIAM
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

// A NOVA PÁGINA DE SUCESSO DA CORA
// → Se o seu arquivo se chama Pago.js, deixa a linha de baixo como está
// → Se o seu arquivo se chama Pago2.js, apaga a linha de baixo e tira o // da linha debaixo dela
import Pago from './screens/Pago';
// import Pago from './screens/Pago2';

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
          <Route path="/sucesso2" element={<Sucesso2 />} />
          <Route path="/erro" element={<Erro />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/saida" element={<Saida />} />

          {/* GRAVADORES */}
          <Route path="/videorecorder" element={<VideoRecordPage />} />
          <Route path="/audiorecorder" element={<AudioRecordPage />} />

          {/* ADMIN */}
          <Route path="/admin/painel" element={<AdminDashboard />} />

          {/* NOVA ROTA QUE A CORA VAI USAR – FUNCIONA COM E SEM BARRA */}
          <Route path="/pago" element={<Pago />} />
          <Route path="/pago/" element={<Pago />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
