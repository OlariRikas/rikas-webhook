const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 10000;

// Webhooki secret
const BOTPRESS_SECRET = 'rikashotels2025';

// Botpressi andmed
const BOT_ID = 'dfb5f95a-4682-449a-bdfd-b8e33064448d';
const BOTPRESS_WEBHOOK_URL = `https://webhook.botpress.cloud/${BOT_ID}`;
const PERSONAL_TOKEN = 'bp_pat_gs6tY0C7ftfJM4zFgREjywTQHGdREu7BOkgj'; // <- Ära jaga avalikult!

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    let push_data = req.body.push_data;

    if (!push_data) {
      console.log('❌ push_data puudub!');
      return res.status(400).send('Missing push_data');
    }

    // Parse push_data JSON
    const parsedData = JSON.parse(push_data);
    console.log('📦 push_data JSON:', parsedData);

    // Töötle telefoninumber
    let rawPhone = parsedData.phone || '';
    rawPhone = rawPhone.trim();
    if (!rawPhone.startsWith('+')) {
      rawPhone = '+' + rawPhone;
    }

    // Kontrolli numbri pikkust
    if (rawPhone.length < 10) {
      console.log('❌ Vigane telefoninumber:', rawPhone);
      return res.status(400).send('Invalid phone number');
    }

    // Valmistame triggeri payloadi
    const triggerPayload = {
      type: 'trigger',
      payload: {
        name: 'send_whatsapp_booking_confirmation',
        data: {
          guest_name: parsedData.guest_name,
          phone: rawPhone
        }
      }
    };

    // Allkiri
    const signature = crypto
      .createHmac('sha256', BOTPRESS_SECRET)
      .update(JSON.stringify(triggerPayload))
      .digest('hex');

    // POST Botpressi
    const response = await axios.post(BOTPRESS_WEBHOOK_URL, triggerPayload, {
      headers: {
        Authorization: `Bearer ${PERSONAL_TOKEN}`,
        'X-Bp-Signature': signature,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ WhatsAppi sõnum saadetud!', response.status);
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ WhatsAppi saatmine ebaõnnestus:', error.message);
    if (error.response) {
      console.error('🛠️ Täpsem info:', error.response.data);
    }
    res.status(500).send('Serveri viga');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${port}`);
});

