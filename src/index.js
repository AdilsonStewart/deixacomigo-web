import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Se houver algum import antigo errado, removemos e deixamos apenas o App.
// Caso precise do AudioRecorder em index.js, aqui está o caminho correto:
//
// import AudioRecorder from './screens/AudioRecorder';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
