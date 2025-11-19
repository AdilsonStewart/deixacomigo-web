import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Servicos.css';

const Servicos = () => {
  const navigate = useNavigate();

  return (
    <div className="servicos-container">
      <h1 className="titulo">Serviços</h1>

      <button 
        className="botao" 
        onClick={() => navigate('/audiorecorder')}
      >
        Gravar Áudio
      </button>

      <button 
        className="botao voltar" 
        onClick={() => navigate('/')}
      >
        Voltar
      </button>
    </div>
  );
};

export default Servicos;
