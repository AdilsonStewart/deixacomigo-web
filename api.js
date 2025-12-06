const express = require('express');
const admin = require('firebase-admin');
const app = express();

// Pega a chave do Firebase das variáveis de ambiente
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountJson) {
  console.error("ERRO: Variável FIREBASE_SERVICE_ACCOUNT_KEY não encontrada!");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error("ERRO: Não foi possível fazer parse da chave do Firebase:", error.message);
  process.exit(1);
}

// Inicializa o Firebase
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log("Firebase inicializado com sucesso!");
} catch (error) {
  console.error("ERRO ao inicializar Firebase:", error.message);
  process.exit(1);
}

app.use(express.json());

// Importa o router de upload de áudio
const uploadAudioRouter = require('./functions/salvar-audio');

// Rota para salvar cliente - IDÊNTICA ao Netlify
app.post('/api/salvar-cliente', async (req, res) => {
  try {
    const dados = req.body;
    console.log("Recebendo dados do cliente:", dados);
    
    // Salva no Firebase Firestore
    const db = admin.firestore();
    const docRef = await db.collection('clientes').add({
      ...dados,
      criadoEm: new Date().toISOString(),
      status: 'ativo'
    });

    console.log("Cliente salvo no Firebase com ID:", docRef.id);
    
    return res.status(200).json({
      success: true,
      clienteId: docRef.id,
      mensagem: "Cliente salvo com sucesso"
    });
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno no servidor"
    });
  }
});

// Usa o router de upload de áudio (a rota será /api/upload, porque o router está definido com a rota /upload e aqui prefixamos com /api)
app.use('/api', uploadAudioRouter);

// Rota de saúde para verificar se a API está online
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API funcionando',
    projeto: serviceAccount.project_id,
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API do DeixaComigo',
    rotas: ['POST /api/salvar-cliente', 'POST /api/upload', 'GET /api/health']
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
  console.log(`Projeto Firebase: ${serviceAccount.project_id}`);
});

// Servir arquivos do React
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

// Todas as rotas não-API vão para o React
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
});
