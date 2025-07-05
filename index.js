const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();

// Toetame vormiandmeid (VUBOOK saadab application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Botpressi Webhook URL ja Secret
const BOTPRESS_URL = 'https://webhook.botpress.cloud/af21a8a8-6e0a-4a72-a110-4f2b9c52b42f';
const BOTPRESS_SECRET = 'rikashotels2025';

// VUBOOK Webhooki endpoint
app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  const guestName = req.body.guest_name || req.body.klient || 'Külaline';
  const phoneRaw = req.body.phone || '';
  const phone = phoneRaw.replace(/\s/g, '');

  if (!phone.startsWith('+')) {
    console.error('❌ Vigane telefoninumber:', phone);
    return res.status(400).send('Vale number');
  }

  const message = `Tere ${guestName}! Aitäh broneeringu eest. Kui vajad abi, kirjuta meile siia WhatsAppi. Soovitame ka tegevusi, restorane ja üritusi linnas! 😊`;

  try {
    const response = await axios.post(BOTPRESS_URL, {
      type: 'text',
      payload: {
        text: message
      },
      channel: 'whatsapp',
      phone: phone
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.BOTPRESS_TOKEN || 'PASTE_YOUR_TOKEN_IF_NEEDED'}`,
        'Content-Type': 'application/json',
        'x-bp-secret': BOTPRESS_SECRET
      }
    });

    console.log('✅ WhatsAppi sõnum saadetud:', response.status, response.data);
    res.send('OK');
  } catch (error) {
    console.error('❌ WhatsAppi saatmine ebaõnnestus:', error.response?.status || error.message);
    console.error('🛠️ Täpsem info:', error.response?.data || 'Pole lisainfot');
    res.sendStatus(500);
  }
});

// Käivita server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${PORT}`);
});

