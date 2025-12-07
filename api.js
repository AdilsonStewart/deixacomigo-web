const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();

// ==================== CONFIGURAÇÃO SUPABASE ====================
console.log('API DeixaComigo com Supabase iniciando...');

// Configuração Supabase
const supabase = createClient(
  'https://kuwsgvhjmjnhkteleczc.supabase.co',
  'sb_publishable_Rgq_kYySn7XB-zPyDG1_Iw_YEVt8O2P',
  { auth: { persistSession: false } }
);

const supabaseAdmin = createClient(
  'https://kuwsgvhjmjnhkteleczc.supabase.co',
  'sb_secret_5lxLpAJn2FMhsNfEXORIRA_vc_muahF',
  { auth: { persistSession: false } }
);

const BUCKET_NAME = 'audios';

// ==================== MIDDLEWARE ====================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== ROTA RAIZ ====================
app.get('/', (req, res) => {
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

// ==================== HEALTH CHECK ====================
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
    res.json({ 
      status: 'OK', 
      storage: error ? 'Erro: ' + error.message : 'Conectado',
      supabase: 'Conectado',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ status: 'ERROR', error: err.message });
  }
});

// ==================== UPLOAD DE ÁUDIO ====================
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
        contentType: 'audio/webm', 
        upsert: false 
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return res.status(200).json({ 
      success: true, 
      url: publicUrl,
      fileName: fileName
    });
    
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== WEBHOOK PAYPAL ====================
app.post('/paypal-webhook', async (req, res) => {
  try {
    console.log('📩 Webhook PayPal recebido:', req.body);
    
    const {
      payment_status,
      txn_id,
      mc_gross,
      custom,
      payer_email,
      payer_id,
      item_name,
    } = req.body;
    
    res.status(200).send('OK');
    
    processPaypalWebhook({
      payment_status,
      txn_id,
      mc_gross,
      custom,
      payer_email,
      payer_id,
      item_name
    });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(200).send('OK');
  }
});

// Função para processar webhook em background
async function processPaypalWebhook(data) {
  try {
    console.log('🔄 Processando webhook em background:', data.txn_id);
    
    let customData = {};
    try {
      customData = data.custom ? JSON.parse(data.custom) : {};
    } catch (e) {
      console.log('Erro ao parsear custom:', e);
    }
    
    if (data.payment_status === 'Completed' || data.payment_status === 'Processed') {
      console.log(`✅ Pagamento confirmado: ${data.txn_id} - R$${data.mc_gross}`);
      
      const { data: pagamento, error } = await supabaseAdmin
        .from('pagamentos')
        .insert([
          {
            transacao_id: data.txn_id,
            valor: parseFloat(data.mc_gross),
            status: data.payment_status,
            tipo: customData.tipo || 'audio',
            email_cliente: data.payer_email,
            id_cliente: data.payer_id,
            descricao: data.item_name,
            dados_adicionais: customData,
            criado_em: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        console.error('❌ Erro ao salvar pagamento:', error);
      } else {
        console.log('✅ Pagamento salvo no Supabase:', pagamento);
        
        if (customData.userId) {
          const { error: clienteError } = await supabaseAdmin
            .from('clientes')
            .update({ 
              status_pagamento: 'ativo',
              ultimo_pagamento: new Date().toISOString(),
              tipo_acesso: customData.tipo || 'audio'
            })
            .eq('id', customData.userId);
          
          if (!clienteError) {
            console.log(`✅ Cliente ${customData.userId} atualizado`);
          }
        }
      }
    } else {
      console.log(`⏳ Pagamento não concluído: ${data.payment_status}`);
    }
    
  } catch (error) {
    console.error('🔥 Erro ao processar webhook:', error);
  }
}

// ==================== ROTA RETORNO (REDIRECIONAMENTO APÓS PAYPAL) ====================
app.get('/retorno', (req, res) => {
  const { tipo, status } = req.query;
  
  console.log('Redirecionando usuário após PayPal:', { tipo, status });
  
  if (status === 'success') {
    if (tipo === 'video') {
      return res.redirect(302, '/videorecord');
    } else if (tipo === 'audio') {
      return res.redirect(302, '/audiorecord');
    }
  }
  
  return res.redirect(302, '/');
});

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 8080;

// Tratamento de erro para o servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API rodando na porta ${PORT}`);
  console.log(`✅ Supabase Storage: ${BUCKET_NAME}`);
  console.log(`✅ Webhook PayPal: /paypal-webhook`);
  console.log(`✅ Rota de retorno: /retorno`);
  console.log(`✅ Health check: /api/health`);
});

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});
