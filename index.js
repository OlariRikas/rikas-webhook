const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Botpress konfiguratsioon
const BOTPRESS_URL = 'https://webhook.botpress.cloud/7e5334c1-07d2-4070-83ed-7d897b5d2fda';
const BOTPRESS_TOKEN = 'bp_pat_KPBXgMopcYsa46jwuSPKaeKCyi4Zmv1rOonW';

app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  const guestName = req.body.guest_name || 'Külaline';
  const phone = (req.body.phone || '').replace(/\s/g, '');

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
        'Authorization': `Bearer ${BOTPRESS_TOKEN}`,
        'Content-Type': 'application/json'
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${PORT}`);
});

