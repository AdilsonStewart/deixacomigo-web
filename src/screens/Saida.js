import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Saida.css';

const Saida = () => {
  const navigate = useNavigate();

  // Pegar o nome do último agendamento salvo
  const getNomeDestinatario = () => {
    try {
      const lastAgendamento = localStorage.getItem('lastAgendamento');
      if (lastAgendamento) {
        const agendamentoData = JSON.parse(lastAgendamento);
        return agendamentoData.nome || 'Não informado';
      }
    } catch (error) {
      console.error('Erro ao buscar dados do agendamento:', error);
    }
    return 'Não informado';
  };

  const nomeDestinatario = getNomeDestinatario();

  // Enviar nova mensagem → volta para SERVICOS
  const handleNovaMensagem = () => {
    localStorage.removeItem('lastRecordingId');
    localStorage.removeItem('lastRecordingUrl');
    navigate('/servicos');
  };

  // Sair do App → volta para HOME
  const handleSair = () => {
    localStorage.clear(); // opcional, mas bom para limpeza
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
        
        <div className="saida-message">
          <p>Sua gravação foi agendada com sucesso!</p>
          <p>Entraremos em contato no telefone informado para enviar a mensagem.</p>
        </div>

        <div className="saida-info">
          <h3>📋 Resumo do Agendamento:</h3>
          <div className="info-item">
            <strong>Status:</strong> <span className="status-confirmado">Confirmado</span>
          </div>
          <div className="info-item">
            <strong>Nome:</strong> {nomeDestinatario}
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
