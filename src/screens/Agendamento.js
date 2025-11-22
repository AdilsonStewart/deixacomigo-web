import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import './Agendamento.css';

// Firebase config (já vindo do Netlify env)
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

  if (!linkMensagem) {
    alert('Ops! Não encontramos a gravação. Volte e grave novamente.');
    navigate(-1);
    return null;
  }

  const handleSchedule = async () => {
    if (!nome || !telefone || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const digits = telefone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      alert('Por favor, insira um telefone válido com DDD');
      return;
    }
    const telefoneFull = `+55${digits}`;

    const hoje = new Date();
    const dataEscolhida = new Date(selectedDate);
    const minimo24h = new Date(hoje.getTime() + 24 * 60 * 60 * 1000 + 5 * 60 * 1000);

    if (dataEscolhida < minimo24h) {
      alert('A corujinha precisa de no mínimo 24 horas de antecedência para garantir a entrega! 🦉❤️');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'agendamentos'), {
        linkMensagem,
        nomeDestinatario: nome.trim(),
        telefoneDestinatario: telefoneFull,
        dataEnvio: selectedDate,
        horarioPreferido: selectedTime,
        enviado: false,
        criadoEm: serverTimestamp(),
      });

      alert('✅ Agendamento salvo com sucesso!\nA corujinha entrega no horário escolhido! 🦉🎉');
      navigate('/saida');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Ocorreu um erro ao salvar. Tenta de novo ou me chama que eu te ajudo ❤️');
    } finally {
      setLoading(false);
    }
  };

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
      <p className="agendamento-subtitle">
        A corujinha entrega sua surpresa no dia e horário escolhidos!
      </p>

      {/* NOME */}
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

      {/* TELEFONE */}
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
        <small className="field-hint">
          Vamos enviar o link da surpresa por SMS
        </small>
      </div>

      {/* DATA */}
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
        <small>Mínimo 24h de antecedência</small>
      </div>

      {/* HORÁRIO */}
      <div className="form-group">
        <label>⏰ Horário de preferência *</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
        >
          <option value="">Selecione o horário</option>
          <option value="08:00-10:00">🕗 08:00 - 10:00 (Manhã)</option>
          <option value="10:00-12:00">🕙 10:00 - 12:00 (Manhã)</option>
          <option value="14:00-16:00">🕑 14:00 - 16:00 (Tarde)</option>
          <option value="16:00-18:00">🕓 16:00 - 18:00 (Tarde)</option>
          <option value="18:00-20:00">🕕 18:00 - 20:00 (Noite)</option>
        </select>
      </div>

      {/* INFO */}
      <div className="agendamento-info">
        <h3>ℹ️ Importante</h3>
        <ul>
          <li>• Entregas de segunda a sábado</li>
          <li>• Mínimo 24h de antecedência</li>
          <li>• A corujinha entrega automaticamente no horário escolhido</li>
        </ul>
      </div>

      {/* BOTÕES */}
      <div className="agendamento-buttons">
        <button
          className="btn-confirm"
          onClick={handleSchedule}
          disabled={loading}
        >
          {loading ? '🦉 Salvando no ninho...' : '✅ Confirmar Agendamento'}
        </button>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ↩️ Voltar
        </button>
      </div>
    </div>
  );
};

export default Agendamento;
