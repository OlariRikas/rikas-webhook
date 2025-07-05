const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const app = express();

const BOTPRESS_URL = 'https://webhook.botpress.cloud/dfb5f95a-4682-449a-bdfd-b8e33064448d';
const BOTPRESS_TOKEN = 'bp_pat_gs6tY0C7ftfJM4zFgREjywTQHGdREu7BOkgj';
const WEBHOOK_SECRET = 'rikashotels2025';

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    // Kontrolli allkirja, kui olemas
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    const receivedSignature = req.headers['x-signature'];

    if (receivedSignature && receivedSignature !== expectedSignature) {
      console.error('❌ Vale allkiri:', receivedSignature);
      return res.status(401).send('Vale allkiri');
    }

    // Proovi push_data JSON välja võtta
    let pushData;
    try {
      pushData = JSON.parse(req.body.push_data);
      console.log('📦 push_data JSON:', pushData);
    } catch (err) {
      console.error('❌ Ei saanud push_data JSON-iks muuta:', err.message);
      return res.status(400).send('push_data pole korrektne JSON');
    }

    // Saadame tagasi vastuse
    res.send('OK');

  } catch (error) {
    console.error('❌ Töötlemisel tekkis viga:', error.message);
    res.sendStatus(500);
  }
});

// Käivita server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${PORT}`);
});

