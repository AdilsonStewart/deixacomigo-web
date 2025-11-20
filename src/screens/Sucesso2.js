.sucesso2-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f4f4f4;
  padding: 20px;
}

.sucesso2-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 14px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.sucesso2-title {
  font-size: 24px;
  color: #28a745;
  margin-bottom: 10px;
}

.sucesso2-text {
  font-size: 18px;
  margin-bottom: 30px;
  color: #333;
}

.sucesso2-subtext {
  font-size: 14px;
  color: #777;
  margin-top: 15px;
}

.sucesso2-loader {
  width: 40px;
  height: 40px;
  border: 4px solid #28a745;
  border-top-color: transparent;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
