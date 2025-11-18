import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sucesso.css';

export default function Sucesso() {
  const navigate = useNavigate();

  useEffect(() => {
    // Configura o timeout para navegar para AudioRecord após 3 segundos
    const timer = setTimeout(() => {
      navigate('/audiorecord');
    }, 3000); // 3 segundos

    // Limpa o timeout se o componente for desmontado
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container sucesso-container">
      <div className="sucesso-card">
        <div className="sucesso-icon">✅</div>
        <h1 className="sucesso-titulo">Pagamento Aprovado!</h1>
        <p className="sucesso-mensagem">
          Seu pagamento de R$ 1,99 foi aprovado com sucesso!
        </p>
        <p className="sucesso-detalhes">
          Agora você pode gravar seu áudio.
        </p>
        <p className="sucesso-redirecionamento">
          Redirecionando para gravação em 3 segundos...
        </p>
        
        <button 
          className="botao botao-sucesso"
          onClick={() => navigate('/audiorecord')}
        >
          🎤 Fazer Gravação Agora
        </button>

        {/* BOTÃO PARA ACESSO DIRETO - SEM PAGAMENTO */}
        <button 
          className="botao botao-teste"
          onClick={() => navigate('/audiorecord')}
          style={{marginTop: '10px', backgroundColor: '#ff6b35'}}
        >
          🎤 Acesso Direto (Teste)
        </button>
        
        <button 
          className="botao-voltar"
          onClick={() => navigate('/')}
        >
          Voltar para Início
        </button>
      </div>
    </div>
  );
}
