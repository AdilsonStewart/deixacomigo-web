import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Saida.css';

const Saida = () => {
  const navigate = useNavigate();

  // Pega os dados do último agendamento salvo no localStorage
  const getAgendamentoData = () => {
    try {
      const saved = localStorage.getItem('lastAgendamento');
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (err) {
      console.error('Erro ao ler agendamento:', err);
      return null;
    }
  };

  const agendamento = getAgendamentoData();

  // Formata data de YYYY-MM-DD para DD/MM/YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return 'A ser definida';
    const [yyyy, mm, dd] = isoDate.split('-');
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleNovaMensagem = () => {
    navigate('/servicos');
  };

  const handleSair = () => {
    localStorage.clear();
    navigate('/');
  };

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

        <h1 className="saida-title">Agendamento Confirmado!</h1>

        <div className="saida-info">
          <h3>Resumo do Agendamento:</h3>

          <div className="info-item">
            <strong>Status:</strong>
            <span className="status-confirmado"> Confirmado</span>
          </div>

          <div className="info-item">
            <strong>Nome do destinatário:</strong>{' '}
            {agendamento?.nome || 'Não informado'}
          </div>

          <div className="info-item">
            <strong>Data da entrega:</strong>{' '}
            {agendamento?.data ? formatDate(agendamento.data) : 'A ser definida'}
          </div>

          <div className="info-item">
            <strong>Horário preferencial:</strong>{' '}
            {agendamento?.horario || 'Não informado'}
          </div>

          <div className="info-item">
            <strong>Entrega:</strong> Via mensagem de texto (SMS) pelo ClickSend
          </div>
        </div>

        <div className="saida-buttons">
          <button className="btn-nova-mensagem" onClick={handleNovaMensagem}>
            Enviar Nova Mensagem
          </button>
          <button className="btn-sair" onClick={handleSair}>
            Sair do App
          </button>
        </div>

        <div className="saida-footer">
          <p>Obrigado por usar nosso serviço! A corujinha agradece!</p>
        </div>
      </div>
    </div>
  );
};

export default Saida;
