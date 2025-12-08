const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();

console.log('API DeixaComigo com Supabase iniciando...');

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

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
      .getPublicUrl(file
