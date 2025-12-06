const express = require('express');
const admin = require('firebase-admin');
const fetch = require('node-fetch'); // ADICIONADO AQUI
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

// Aumenta limite para áudio em base64
app.use(express.json({ limit: '50mb' }));

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

// Rota para salvar áudio - NOVA ROTA ADICIONADA
app.post('/api/upload', async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ 
        success: false, 
        error: 'audioBase64 é obrigatório no corpo da requisição' 
      });
    }

    // Remove o prefixo data:audio/webm;base64, se existir
    const base64 = audioBase64.includes(',') 
      ? audioBase64.split(',')[1] 
      : audioBase64;
    
    const fileName = `audios/gravacao_${Date.now()}.webm`;

    // Upload para Firebase Storage
    await fetch(
      `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o?name=${encodeURIComponent(fileName)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: Buffer.from(base64, 'base64'),
      }
    );

    // URL de acesso ao arquivo
    const url = `https://firebasestorage.googleapis.com/v0/b/deixacomigo-727ff.appspot.com/o/${encodeURIComponent(fileName)}?alt=media`;

    return res.status(200).json({ 
      success: true, 
      url 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

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
    rotas: [
      'POST /api/salvar-cliente',
      'POST /api/upload',  // NOVA ROTA ADICIONADA AQUI
      'GET /api/health'
    ]
  });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
  console.log(`📁 Projeto Firebase: ${serviceAccount.project_id}`);
  console.log(`📤 Rota de upload disponível: POST /api/upload`);
});
