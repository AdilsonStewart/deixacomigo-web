import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Saida.css';

const Saida = () => {
  const navigate = useNavigate();

  const handleNovaMensagem = () => {
    // Limpar dados anteriores e voltar para gravação
    localStorage.removeItem('lastRecordingId');
    localStorage.removeItem('lastRecording');
    navigate('/audiorecorder');
  };

  const handleSair = () => {
    // Fechar a aba/janela do navegador
    window.close();
    
    // Fallback para mobile ou navegadores que não permitem fechar
    alert('Obrigado por usar nosso serviço!');
    navigate('/');
  };

  return (
    <div className="saida-container">
      <div className="saida-content">
        <div className="success-icon">✅</div>
        <h1 className="saida-title">Agendamento Confirmado!</h1>
        
        <div className="saida-message">
          <p>Sua gravação foi agendada com sucesso!</p>
          <p>Entraremos em contato no telefone informado para enviar o áudio.</p>
        </div>

        <div className="saida-info">
          <h3>📋 Resumo do Agendamento:</h3>
          <div className="info-item">
            <strong>Status:</strong> <span className="status-confirmado">Confirmado</span>
          </div>
          <div className="info-item">
            <strong>Entrega:</strong> Via mensagem
          </div>
          <div className="info-item">
            <strong>Prazo:</strong> Até 24 horas
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
