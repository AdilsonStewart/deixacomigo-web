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
app.use(express.urlencoded({ extended: true })); // ESSENCIAL para PayPal

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
    
    // Remove data URL se presente
    const base64Data = audioBase64.includes(',') 
      ? audioBase64.split(',')[1] 
      : audioBase64;
    
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${crypto.randomUUID()}.webm`;
    
    // Upload usando admin para ter permissões
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { 
        contentType: 'audio/webm', 
        upsert: false 
      });
    
    if (error) throw error;
    
    // Gera URL pública
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
    
    // PayPal envia como x-www-form-urlencoded
    const {
      payment_status,
      txn_id,
      mc_gross,
      custom,
      payer_email,
      payer_id,
      item_name,
    } = req.body;
    
    // SEMPRE retorne 200 OK para PayPal imediatamente
    res.status(200).send('OK');
    
    // Processa em background
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
    res.status(200).send('OK'); // PayPal requer 200 mesmo em erro
  }
});

// Função para processar webhook em background
async function processPaypalWebhook(data) {
  try {
    console.log('🔄 Processando webhook em background:', data.txn_id);
    
    // Parse dos dados customizados
    let customData = {};
    try {
      customData = data.custom ? JSON.parse(data.custom) : {};
    } catch (e) {
      console.log('Erro ao parsear custom:', e);
    }
    
    // Verificar se pagamento foi concluído
    if (data.payment_status === 'Completed' || data.payment_status === 'Processed') {
      console.log(`✅ Pagamento confirmado: ${data.txn_id} - R$${data.mc_gross}`);
      
      // 1. SALVAR NO SUPABASE (tabela pagamentos)
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
        
        // 2. ATUALIZAR STATUS DO CLIENTE (se necessário)
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

// ==================== ROTA RETORNO (para frontend React) ====================
app.get('/retorno', (req, res) => {
  const { tipo, status, orderID } = req.query;
  
  console.log('🔗 Redirecionamento usuário:', { tipo, status, orderID });
  
  // Página HTML simples para redirecionamento
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Processando pagamento...</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        text-align: center; 
        margin-top: 80px; 
        background: #f5f5f5;
      }
      .container {
        background: white;
        padding: 40px;
        border-radius: 10px;
        display: inline-block;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Processando retorno do pagamento...</h2>
      <div class="spinner"></div>
      <p>Aguarde, estamos redirecionando você.</p>
    </div>
    <script>
      // Redireciona baseado nos parâmetros (igual ao seu componente React)
      const params = new URLSearchParams(window.location.search);
      const tipo = params.get('tipo');
      const status = params.get('status');
      
      if (status === 'success') {
        if (tipo === 'video') {
          window.location.href = '/videorecord';
        } else if (tipo === 'audio') {
          window.location.href = '/audiorecord';
        } else {
          window.location.href = '/';
        }
      } else {
        window.location.href = '/';
      }
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API rodando na porta ${PORT}`);
  console.log(`✅ Supabase Storage: ${BUCKET_NAME}`);
  console.log(`✅ Webhook PayPal: /paypal-webhook`);
  console.log(`✅ Rota de retorno: /retorno`);
  console.log(`✅ Health check: /api/health`);
});
