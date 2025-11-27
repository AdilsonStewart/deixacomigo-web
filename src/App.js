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

// NOVAS PÁGINAS DE SUCESSO
import Pago from './screens/Pago';        // ou Pago2 se preferir
// import Pago2 from './screens/Pago2';    // descomente essa e comente a de cima se quiser usar Pago2

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

          {/* NOVA ROTA QUE VAI FUNCIONAR 100% COM A CORA */}
          <Route path="/pago" element={<Pago />} />
          <Route path="/pago/" element={<Pago />} />   {/* com ou sem barra */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
