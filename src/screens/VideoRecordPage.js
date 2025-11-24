// src/screens/VideoRecordPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-client'; // usa o cliente seguro
import './VideoRecorder.css'; // apenas CSS puro aqui

const VideoRecordPage = () => {
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPagamento = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser')) || null; // exemplo de auth simples

        if (!user) {
          alert("Você precisa estar logado.");
          setPago(false);
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'usuarios-asaas', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          alert("Usuário não encontrado.");
          setPago(false);
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        setPago(userData.pago === true);
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
        setPago(false);
      } finally {
        setLoading(false);
      }
    };

    checkPagamento();
  }, []);

  if (loading) return <p>Carregando...</p>;

  if (!pago) {
    return (
      <div className="video-container">
        <h2>💡 Para acessar a gravação, você precisa pagar primeiro.</h2>
        <button className="btn-new" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="video-container">
      <h1 className="video-title">Gravar Vídeo</h1>
      <p className="phase-title">Funcionalidade em desenvolvimento...</p>

      <button className="btn-new" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
};

export default VideoRecordPage;
