import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Agendamento.css';

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

const Agendamento = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const linkMensagem = localStorage.getItem('lastRecordingUrl');

  const handleSchedule = async () => {
    // Validações básicas
    if (!nome || !telefone || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const digits = telefone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      alert('Por favor, insira um telefone válido com DDD');
      return;
    }
    const telefoneFull = `+55${digits}`;

    // Verifica se é pelo menos 24h no futuro
    const hoje = new Date();
    const dataEscolhida = new Date(selectedDate);
    const minimo24h = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);

    if (dataEscolhida < minimo24h) {
      alert('A corujinha precisa de no mínimo 24 horas! 🦉');
      return;
    }

    setLoading(true);

    try {
      // ✅ SALVA NO FIRESTORE - ESTRUTURA SIMPLES
      await addDoc(collection(db, 'agendamentos'), {
        linkMensagem,
        nome: nome.trim(),
        telefone: telefoneFull,
        data: selectedDate,        // Ex: "2024-01-15"
        horario: selectedTime,     // Ex: "08:00-10:00"
        status: 'agendado',
        criadoEm: serverTimestamp()
      });

      // ✅ SALVA NO LOCALSTORAGE também
      localStorage.setItem('lastAgendamento', JSON.stringify({
        nome: nome.trim(),
        data: selectedDate,
        horario: selectedTime,
        status: 'Agendado'
      }));

      alert('✅ Agendado! A corujinha vai entregar sua mensagem! 🦉');
      navigate('/saida');
      
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Ops! Tenta de novo ou me chama! ❤️');
    } finally {
      setLoading(false);
    }
  };

  // (Mantém as funções formatPhone, handlePhoneChange, getMinDate, getMaxDate)
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (e) => {
    setTelefone(formatPhone(e.target.value));
  };

  const getMinDate = () => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    return amanha.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 365);
    return max.toISOString().split('T')[0];
  };

  return (
    <div className="agendamento-container">
      <h1 className="agendamento-title">📅 Agendar Entrega</h1>
      
      <div className="form-group">
        <label>👤 Nome de quem vai receber *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Maria Silva"
          required
        />
      </div>

      <div className="form-group">
        <label>📞 Celular com DDD *</label>
        <input
          type="tel"
          value={telefone}
          onChange={handlePhoneChange}
          placeholder="(41) 99999-8888"
          maxLength="15"
          required
        />
      </div>

      <div className="form-group">
        <label>📆 Data da entrega *</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={getMinDate()}
          max={getMaxDate()}
          required
        />
      </div>

      <div className="form-group">
        <label>⏰ Horário de preferência *</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
        >
          <option value="">Selecione o horário</option>
          <option value="08:00-10:00">🕗 08:00 - 10:00</option>
          <option value="10:00-12:00">🕙 10:00 - 12:00</option>
          <option value="14:00-16:00">🕑 14:00 - 16:00</option>
          <option value="16:00-18:00">🕓 16:00 - 18:00</option>
          <option value="18:00-20:00">🕕 18:00 - 20:00</option>
        </select>
      </div>

      <div className="agendamento-buttons">
        <button
          className="btn-confirm"
          onClick={handleSchedule}
          disabled={loading}
        >
          {loading ? '🦉 Salvando...' : '✅ Confirmar Agendamento'}
        </button>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ↩️ Voltar
        </button>
      </div>
    </div>
  );
};

export default Agendamento;
