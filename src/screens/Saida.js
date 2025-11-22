
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Saida.css';

const Saida = () => {
  const navigate = useNavigate();

  // tenta extrair nome/data de vários formatos possíveis salvos no localStorage
  const getAgendamentoData = () => {
    try {
      const raw = localStorage.getItem('lastAgendamento');
      console.log('[Saida] raw lastAgendamento:', raw);
      if (!raw) return null;

      const data = JSON.parse(raw);

      // procura possíveis variações de campo para nome
      const nome =
        data.nome ||
        data.nomeDestinatario ||
        data.nomeDestinatário ||
        data.name ||
        data.nome_destinatario ||
        data.nome_destino ||
        null;

      // procura possíveis variações de campo para data
      const dataField =
        data.dataEntrega ||
        data.dataEnvio ||
        data.date ||
        data.data ||
        data.deliveryDate ||
        null;

      // Se houver data no formato com hor/time concatenado, tenta extrair ISO yyyy-mm-dd
      // Se não, retorna como está (formatDate lidará com null/strings)
      return {
        rawObject: data,
        nome: nome || null,
        dataRaw: dataField || null,
      };
    } catch (err) {
      console.error('[Saida] Erro ao ler/parsear lastAgendamento:', err);
      return null;
    }
  };

  const agendamento = getAgendamentoData();

  // formata YYYY-MM-DD ou tenta converter Date válida pra DD/MM/AAAA
  const formatDate = (value) => {
    if (!value) return 'Não informado';

    // se já estiver no formato DD/MM/AAAA, retorna direto
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

    // se for YYYY-MM-DD (data input type="date"), formata
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [yyyy, mm, dd] = value.split('-');
      return `${dd}/${mm}/${yyyy}`;
    }

    // tenta criar Date e formatar (fallback)
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }

    // se não conseguiu formatar, retorna o raw (ou 'Não informado')
    return typeof value === 'string' && value.length ? value : 'Não informado';
  };

  // DEBUG: mostra o objeto encontrado (apenas no console)
  if (agendamento) {
    console.log('[Saida] agendamento parseado:', agendamento.rawObject);
  } else {
    console.log('[Saida] nenhum lastAgendamento encontrado');
  }

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
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTFxazJnZHYxaWJnNW4xb2dwcGlzbm1jemR3a3praTUydGVjNmljciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/9yKwHwVJDRSmkSRPr5/giphy.gif"
            alt="Confirmação de agendamento"
            className="success-gif"
          />
        </div>

        <h1 className="saida-title">Agendamento Confirmado!</h1>

        <p className="saida-message">Sua gravação foi agendada com sucesso! 🦉✨</p>

        <div className="saida-info">
          <h3>📋 Resumo do Agendamento:</h3>

          <div className="info-item">
            <strong>Status:</strong>
            <span className="status-confirmado"> Confirmado ✅</span>
          </div>

          <div className="info-item">
            <strong>Nome:</strong>{' '}
            {agendamento?.nome ? agendamento.nome : 'Não informado'}
          </div>

          <div className="info-item">
            <strong>Data da entrega:</strong>{' '}
            {formatDate(agendamento?.dataRaw)}
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
