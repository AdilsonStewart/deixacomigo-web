import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamento.css';

const Agendamento = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !address) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // Aqui vamos integrar com Firestore depois
    const agendamentoData = {
      date: selectedDate,
      time: selectedTime,
      address: address,
      instructions: instructions,
      timestamp: new Date().toISOString()
    };
    
    console.log('Dados do agendamento:', agendamentoData);
    alert('Entrega agendada com sucesso!');
    navigate('/sucesso');
  };

  // Gerar datas disponíveis (próximos 30 dias)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="agendamento-container">
      <h1 className="agendamento-title">📅 Agendar Entrega</h1>
      <p className="agendamento-subtitle">Escolha a data e horário para entrega da sua gravação</p>
      
      <div className="form-group">
        <label>📆 Data de Entrega *</label>
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
        <label>⏰ Horário de Preferência *</label>
        <select 
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
        >
          <option value="">Selecione um horário</option>
          <option value="08:00-10:00">🕗 08:00 - 10:00 (Manhã)</option>
          <option value="10:00-12:00">🕙 10:00 - 12:00 (Manhã)</option>
          <option value="14:00-16:00">🕑 14:00 - 16:00 (Tarde)</option>
          <option value="16:00-18:00">🕓 16:00 - 18:00 (Tarde)</option>
          <option value="18:00-20:00">🕕 18:00 - 20:00 (Noite)</option>
        </select>
      </div>

      <div className="form-group">
        <label>🏠 Endereço de Entrega *</label>
        <textarea 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Digite o endereço completo: rua, número, bairro, cidade, CEP..."
          rows="3"
          required
        />
      </div>

      <div className="form-group">
        <label>📝 Instruções Adicionais (opcional)</label>
        <textarea 
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Portaria, ponto de referência, instruções especiais..."
          rows="2"
        />
      </div>

      <div className="agendamento-info">
        <h3>ℹ️ Informações Importantes:</h3>
        <ul>
          <li>• Entregas de segunda a sábado</li>
          <li>• Horário comercial: 8h às 20h</li>
          <li>• Confirmação por WhatsApp 1h antes da entrega</li>
        </ul>
      </div>

      <div className="agendamento-buttons">
        <button className="btn-confirm" onClick={handleSchedule}>
          ✅ Confirmar Agendamento
        </button>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ↩️ Voltar para Gravação
        </button>
      </div>
    </div>
  );
};

export default Agendamento;
