import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Saida.css';

const Saida = () => {
  const navigate = useNavigate();

  const getAgendamentoData = () => {
    try {
      const saved = localStorage.getItem('lastAgendamento');
      if (!saved) return null;

      const data = JSON.parse(saved);

      return {
        nome: data.nome || 'Não informado',
        dataEnvio: data.dataEnvio || null,
      };
    } catch (err) {
      console.error('Erro ao ler agendamento:', err);
      return null;
    }
  };

  const agendamento = getAgendamentoData();

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Não informado';
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
            src="/ofelia.png"
            alt="Confirmação de agendamento"
            className="success-gif"
          />
        </div>

        <h1 className="saida-title">Agendamento Confirmado!</h1>

        <p className="saida-message">
          Sua gravação foi agendada com sucesso! 🦉✨
        </p>

        <div className="saida-info">
          <h3>📋 Resumo do Agendamento:</h3>

          <div className="info-item">
            <strong>Status:</strong>
            <span className="status-confirmado"> Confirmado ✅</span>
          </div>

          <div className="info-item">
            <strong>Nome:</strong>{' '}
            {agendamento?.nome || 'Não informado'}
          </div>

          <div className="info-item">
            <strong>Data da entrega:</strong>{' '}
            {formatDate(agendamento?.dataEnvio)}
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
