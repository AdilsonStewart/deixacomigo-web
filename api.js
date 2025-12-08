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

// Serve arquivos estáticos do build quando existir
const buildPath = path.join(__dirname, 'build');
const fs = require('fs');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  // Para qualquer rota que não seja API, devolver o index.html (SPA)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/paypal-webhook') || req.path.startsWith('/retorno')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.get('/', (req, res) => {
  // Se o build existir, a middleware acima já terá servido index.html; caso contrário retorna o JSON da API
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

// --- Incluir abaixo no api.js: endpoints para PayPal webhook (GET/HEAD para validação + POST para receber eventos) ---
app.get('/paypal-webhook', (req, res) => {
  // PayPal e alguns validadores chamam a URL com GET/HEAD para verificar reachability.
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.status(200).send('OK');
});

app.head('/paypal-webhook', (req, res) => {
  return res.sendStatus(200);
});

app.post('/paypal-webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const body = req.body || {};
    console.log('PayPal webhook received:', JSON.stringify(body).slice(0, 2000));

    // Processa apenas eventos de pagamento concluído
    const evt = body.event_type;
    if (evt === 'PAYMENT.CAPTURE.COMPLETED' || evt === 'PAYMENT.SALE.COMPLETED') {
      const resource = body.resource || {};
      const custom = resource.custom; // id do pedido enviado na criação do pagamento
      const transactionId = resource.id;
      const payerEmail = resource.payer?.email_address || '';

      if (custom) {
        // Atualiza pedido no Supabase (usa supabaseAdmin que já existe em api.js)
        try {
          await supabaseAdmin
            .from('pedidos')
            .update({
              status: 'PAGO',
              transactionId,
              payerEmail,
              pagoEm: new Date().toISOString(),
            })
            .eq('id', custom);

          console.log(`Pedido ${custom} marcado como PAGO via webhook PayPal.`);
        } catch (dbErr) {
          console.error('Erro atualizando pedido no Supabase:', dbErr);
        }
      } else {
        console.warn('Webhook PayPal recebido sem campo resource.custom — não atualizou pedido.');
      }
    } else {
      console.log('Evento PayPal ignorado:', evt);
    }

    // Responde 200 para PayPal
    return res.status(200).send('Webhook processado');
  } catch (err) {
    console.error('Erro no endpoint /paypal-webhook:', err);
    return res.status(500).send('Erro ao processar Webhook');
  }
});
// --- fim do bloco PayPal webhook ---

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
