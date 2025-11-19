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
      alert('Preencha data, horário e endereço!');
      return;
    }

    // Salvar agendamento localmente
    const agendamentoData = {
      recordingId: localStorage.getItem('lastRecordingId'),
      date: selectedDate,
      time: selectedTime,
      address: address,
      instructions: instructions,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('lastAgendamento', JSON.stringify(agendamentoData));
    
    alert('✅ Entrega agendada com sucesso!');
    navigate('/sucesso');
  };

  // ... (resto do código permanece igual)
};
