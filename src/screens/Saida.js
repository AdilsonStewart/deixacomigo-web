import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './Saida.css';

// Config Firebase (mesma do Agendamento)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Saida = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtém o ID do agendamento do estado da navegação ou do localStorage
  const agendamentoId = location.state?.agendamentoId || localStorage.getItem('lastAgendamentoId');

  useEffect(() => {
    const fetchAgendamento = async () => {
      if (!agendamentoId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'agendamentos', agendamentoId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAgendamento(docSnap.data());
        } else {
          console.log("Agendamento não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar agendamento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamento();
  }, [agendamentoId]);

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Não informado';
    const [yyyy, mm, dd] = isoDate.split('-');
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleNovaMensagem = () => {
    navigate('/servicos');
  };

  const handleSair = () => {
    // Limpa o localStorage do agendamento?
    localStorage.removeItem('lastAgendamentoId');
    navigate('/');
  };

  if (loading) {
    return <div className="saida-container">Carregando...</div>;
  }

  if (!agendamento) {
    return (
      <div className="saida-container">
        <div className="saida-content">
          <h1>Agendamento não encontrado</h1>
          <button onClick={() => navigate('/agendamento')}>Fazer Agendamento</button>
        </div>
      </div>
    );
  }

  return (
    <div className="saida-container">
      <div className="saida-content">

        <div className="gif-container">
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTNoNnJiOHFwOHczb3VvbDg1bngxN3F3eG93dG01YXplbWoyMDJodiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Y258CvWqb5qyfp5JA9/giphy.gif"
            alt="Confirmação de agendamento"
            className="success-gif"
          />
        </div>

        <h1 className="saida-title">Agendamento Confirmado! 🦉✨</h1>

        <div className="saida-info">
          <h3>📋 Resumo do Agendamento:</h3>

          <div className="info-item">
            <strong>Status:</strong>
            <span className="status-confirmado"> Confirmado ✅</span>
          </div>

          <div className="info-item">
            <strong>Nome do destinatário:</strong>{' '}
            {agendamento.nome || 'Não informado'}
          </div>

          <div className="info-item">
            <strong>Data da entrega:</strong>{' '}
            {formatDate(agendamento.data)}
          </div>

          <div className="info-item">
            <strong>Horário preferencial:</strong>{' '}
            {agendamento.horario || 'Não informado'}
          </div>

          <div className="info-item">
            <strong>Entrega:</strong> Via mensagem de texto (SMS)
          </div>
        </div>

        <div className="saida-buttons">
          <button className="btn-nova-mensagem" onClick={handleNovaMensagem}>
            🎤 Enviar Nova Mensagem
          </button>

          <button className="btn-sair" onClick={handleSair}>
            🚪 Sair do App
          </button>
        </div>

        <div className="saida-footer">
          <p>Obrigado por usar nosso serviço! A corujinha agradece! 💜</p>
        </div>
      </div>
    </div>
  );
};

export default Saida;
