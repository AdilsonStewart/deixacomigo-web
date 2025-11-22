import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Saida.css';

const Saida = () => {
  const navigate = useNavigate();

  const getAgendamentoInfo = () => {
    try {
      const last = localStorage.getItem('lastAgendamento');
      if (!last) return {};

      const data = JSON.parse(last);

      // Formata data: DD/MM/YYYY
      const dataFormatada = data.dataEnvio
        ? new Date(data.dataEnvio).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : 'Não informada';

      return {
        nome: data.nome || 'Não informado',
        data: dataFormatada,
      };
    } catch (err) {
      console.error('Erro ao carregar agendamento:', err);
      return {};
    }
  };

  const { nome, data } = getAgendamentoInfo();

  const handleNovaMensagem = () => {
    localStorage.removeItem('lastRecordingId');
    localStorage.removeItem('lastRecordingUrl');
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
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTFxazJnZHYxaWJnNW4xb2dwcGlzbm1jemR3a3praTUydGVjNmljciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/9yKwHwVJDRSmkSRPr5/giphy.gif"
            alt="Confirmação de agendamento"
            className="success-gif"
          />
        </div>

        <h1 className="saida-title">Agendamento Confirmado!</h1>

        <div className="saida-info">
          <h3>📋 Resumo do Agendamento:</h3>

          <div className="info-item">
            <strong>Status:</strong> <span className="status-confirmado">Confirmado</span>
          </div>

          <div className="info-item">
            <strong>Nome:</strong> {nome}
          </div>

          <div className="info-item">
            <strong>Data da entrega:</strong> {data}
          </div>

          <div className="info-item">
            <strong>Entrega:</strong> Via mensagem
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
          <p>Obrigado por usar nosso serviço! 💜</p>
        </div>
      </div>
    </div>
  );
};

export default Saida;
