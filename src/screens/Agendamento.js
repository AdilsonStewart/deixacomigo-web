import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Agendamento = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const linkMensagem = localStorage.getItem('lastRecordingUrl') || '';

  const horariosFixos = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  const handleSchedule = async () => {
    if (!nome || !telefone || !selectedDate || !selectedTime) {
      alert('Preencha todos os campos!');
      return;
    }

    const digits = telefone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      alert('Telefone inválido! Use 10 ou 11 dígitos.');
      return;
    }

    const telefoneFull = `55${digits}`; // +55 já incluso

    const hoje = new Date();
    const dataEscolhida = new Date(selectedDate);
    const minimo24h = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
    if (dataEscolhida < minimo24h) {
      alert('O agendamento precisa ser com no mínimo 24 horas de antecedência!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/.netlify/functions/salvar-agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefoneFull,
          data: selectedDate,
          hora: selectedTime,
          linkMidia: linkMensagem,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Agendamento confirmado! O cliente receberá o áudio automaticamente no dia e horário escolhidos.");
        navigate('/saida');
      } else {
        alert("Erro ao salvar agendamento. Tente novamente.");
      }
    } catch (err) {
      alert("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (v) => {
    const n = v.replace(/\D/g, '');
    if (n.length <= 11) {
      return n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return v;
  };

  const minDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // mínimo 48h pra dar margem
    return d.toISOString().split('T')[0];
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "2.8rem", marginBottom: "30px" }}>Agendar Entrega</h1>

      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "40px",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "500px",
        backdropFilter: "blur(10px)"
      }}>
        <input
          type="text"
          placeholder="Nome do destinatário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ width: "100%", padding: "15px", margin: "10px 0", borderRadius: "10px", border: "none", fontSize: "1.1rem" }}
        />

        <input
          type="tel"
          placeholder="(41) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(formatPhone(e.target.value))}
          maxLength="15"
          style={{ width: "100%", padding: "15px", margin: "10px 0", borderRadius: "10px", border: "none", fontSize: "1.1rem" }}
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={minDate()}
          style={{ width: "100%", padding: "15px", margin: "10px 0", borderRadius: "10px", border: "none", fontSize: "1.1rem" }}
        />

        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          style={{ width: "100%", padding: "15px", margin: "10px 0", borderRadius: "10px", border: "none", fontSize: "1.1rem" }}
        >
          <option value="">Escolha o horário</option>
          {horariosFixos.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <button
          onClick={handleSchedule}
          disabled={loading}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "18px",
            fontSize: "1.4rem",
            background: loading ? "#666" : "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "50px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Salvando agendamento..." : "Confirmar Agendamento"}
        </button>
      </div>
    </div>
  );
};

export default Agendamento;
