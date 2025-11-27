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

import './App.css';

// Componente Pago DIRETO no App.js - para áudio
const Pago = () => {
  return (
    <div style={{
      fontFamily: 'Arial',
      textAlign: 'center',
      padding: '50px',
      background: '#10b981',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem' }}>OBRIGADO! 😍</h1>
      <p>Seu pagamento foi aprovado com sucesso!</p>
      <p>Seu <strong>áudio</strong> será encaminhado de acordo com o seu agendamento após gravação.</p>
      
      <button
        onClick={() => window.location.href = '/audiorecorder'}
        style={{
          background: 'white',
          color: '#10b981',
          border: 'none',
          padding: '15px 30px',
          fontSize: '1.1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '20px'
        }}
      >
        🎤 GRAVAR ÁUDIO AGORA
      </button>
    </div>
  );
};

// Componente Pago2 DIRETO no App.js - para vídeo
const Pago2 = () => {
  return (
    <div style={{
      fontFamily: 'Arial',
      textAlign: 'center',
      padding: '50px',
      background: '#10b981',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem' }}>OBRIGADO! 😍</h1>
      <p>Seu pagamento foi aprovado com sucesso!</p>
      <p>Seu <strong>vídeo</strong> será encaminhado de acordo com o seu agendamento após gravação.</p>
      
      <button
        onClick={() => window.location.href = '/video-record'}
        style={{
          background: 'white',
          color: '#10b981',
          border: 'none',
          padding: '15px 30px',
          fontSize: '1.1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '20px'
        }}
      >
        🎥 GRAVAR VÍDEO AGORA
      </button>
    </div>
  );
};

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

          {/* ROTAS DIRETAS - SEM IMPORTAÇÕES EXTERNAS */}
          <Route path="/pago" element={<Pago />} />
          <Route path="/pago2" element={<Pago2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
