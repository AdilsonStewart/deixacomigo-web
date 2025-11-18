import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Cadastro from './screens/Cadastro';
import Servicos from './screens/Servicos';
import Sucesso from './screens/Sucesso';
import Erro from './screens/Erro';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/sucesso" element={<Sucesso />} />
          <Route path="/erro" element={<Erro />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
