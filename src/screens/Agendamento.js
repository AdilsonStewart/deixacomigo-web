import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamento.css';

const Agendamento = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSchedule = () => {
    if (!nome || !telefone || !selectedDate || !selectedTime) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // Validar telefone (mínimo 10 dígitos com DDD)
    const phoneDigits = telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Por favor, insira um telefone válido com DDD');
      return;
    }

    // Salvar agendamento localmente
    const agendamentoData = {
      recordingId: localStorage.getItem('lastRecordingId'),
      nome: nome,
      telefone: telefone,
      date: selectedDate,
      time: selectedTime,
      instructions: instructions,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('lastAgendamento', JSON.stringify(agendamentoData));
    
    alert('✅ Entrega agendada com sucesso!');
    navigate('/sucesso');
  };

  // Formatador de telefone
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setTelefone(formatted);
  };

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
      <p className="agendamento-subtitle">Preencha seus dados para enviar a gravação</p>
      
      {/* CAMPO NOME */}
      <div className="form-group">
        <label>👤 Nome Completo *</label>
        <input 
          type="text" 
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome de quem receberá"
          required
        />
      </div>

      {/* CAMPO TELEFONE */}
      <div className="form-group">
        <label>📞 Telefone para Entrega *</label>
        <input 
          type="tel" 
          value={telefone}
          onChange={handlePhoneChange}
          placeholder="(00) 00000-0000"
          maxLength="15"
          required
        />
        <small className="field-hint">Com DDD - enviaremos a gravação por mensagem</small>
      </div>

      {/* DATA DE ENTREGA */}
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

      {/* HORÁRIO */}
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

      {/* INSTRUÇÕES OPCIONAIS */}
      <div className="form-group">
        <label>📝 Observações (opcional)</label>
        <textarea 
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Alguma observação especial sobre a entrega..."
          rows="2"
        />
      </div>

      {/* INFORMAÇÕES IMPORTANTES */}
      <div className="agendamento-info">
        <h3>ℹ️ Informações Importantes:</h3>
        <ul>
          <li>• Entregas de segunda a sábado</li>
          <li>• Horário comercial: 8h às 20h</li>
          <li>• Entregas feitas por mensagens MSN</li>
          <li>• Confirme as informações antes de enviar</li>
        </ul>
      </div>

      {/* BOTÕES */}
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
