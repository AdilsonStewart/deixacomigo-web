import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamento.css';

const Agendamento = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');

  const handleSchedule = () => {
    // Aqui vamos integrar com Firestore depois
    console.log('Agendamento:', { selectedDate, selectedTime, address });
    alert('Entrega agendada com sucesso!');
    navigate('/sucesso');
  };

  return (
    <div className="agendamento-container">
      <h1 className="agendamento-title">Agendar Entrega</h1>
      
      <div className="form-group">
        <label>Data de Entrega:</label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="form-group">
        <label>Horário:</label>
        <select 
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          <option value="">Selecione um horário</option>
          <option value="08:00-10:00">08:00 - 10:00</option>
          <option value="10:00-12:00">10:00 - 12:00</option>
          <option value="14:00-16:00">14:00 - 16:00</option>
          <option value="16:00-18:00">16:00 - 18:00</option>
        </select>
      </div>

      <div className="form-group">
        <label>Endereço de Entrega:</label>
        <textarea 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Digite o endereço completo para entrega"
          rows="4"
        />
      </div>

      <div className="agendamento-buttons">
        <button className="btn-confirm" onClick={handleSchedule}>
          ✅ Confirmar Agendamento
        </button>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ↩️ Voltar
        </button>
      </div>
    </div>
  );
};

export default Agendamento;
