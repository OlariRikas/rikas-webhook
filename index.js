const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    const rawPushData = req.body.push_data;

    if (!rawPushData) {
      return res.status(400).send('❌ push_data puudub');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawPushData);
    } catch (err) {
      return res.status(400).send('❌ push_data pole korrektne JSON');
    }

    console.log('📦 push_data JSON:', parsed);

    const guestName = parsed.guest_name || 'Külaline';
    let phone = parsed.phone || '';

    phone = phone.replace(/\s+/g, '');

    if (!phone || !phone.startsWith('+')) {
      console.error('❌ Vigane telefoninumber:', phone);
      return res.status(400).send('❌ Vigane telefoninumber');
    }

    const payload = {
      type: 'template',
      template: {
        name: 'booking_confirmation',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: guestName }]
          }
        ]
      },
      to: phone,
      headers: { 'Content-Type': 'application/json' }
    };

    const signature = crypto
      .createHmac('sha256', 'rikashotels2025')
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await axios.post(
      'https://api.botpress.cloud/v1/messages',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.BOTPRESS_TOKEN}`,
          'X-Botpress-Signature': signature,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsAppi sõnum saadetud:', response.data);
    res.send('OK');
  } catch (err) {
    console.error('❌ WhatsAppi saatmine ebaõnnestus:', err.message);
    res.status(500).send('❌ Serveri viga');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${PORT}`);
});

