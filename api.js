const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');

const app = express();

console.log('API DeixaComigo com Supabase iniciando...');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kuwsgvhjmjnhkteleczc.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_sb_publishable_Rgq_kYySn7XB-zPyDG1_Iw_YEVt8O2P";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_sb_secret_p4x9IRq1WoKdjJ7ZwSYeAg_K-SOzlW0";
const BUCKET_NAME = process.env.BUCKET_NAME || 'audios';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Aviso: variáveis do Supabase não definidas. Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.');
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos do build (quando existir)
const buildPath = path.join(__dirname, 'build');
if (require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // para qualquer rota que não seja API, devolver index.html (SPA)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/paypal-webhook') || req.path.startsWith('/retorno')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.get('/', (req, res) => {
  // se o build existir, o middleware acima já terá servido o index.html, então este JSON só aparece quando não há build
  res.json({
    message: 'API DeixaComigo com Supabase',
    status: 'OK',
    endpoints: {
      root: '/',
      health: '/api/health',
      upload: '/api/upload (POST)',
      paypalWebhook: '/paypal-webhook (POST)',
      retorno: '/retorno (GET)'
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
    res.json({
      status: 'OK',
      storage: error ? 'Erro: ' + error.message : 'Conectado',
      supabase: SUPABASE_URL ? 'Configurado' : 'Não configurado',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ status: 'ERROR', error: err.message });
  }
});

app.post('/api/upload', async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        error: 'audioBase64 é obrigatório'
      });
    }

    const base64Data = audioBase64.includes(',')
      ? audioBase64.split(',')[1]
      : audioBase64;

    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${crypto.randomUUID()}.webm`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: 'audio/webm'
      });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
