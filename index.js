const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// Middleware, et toetada nii JSON kui URL-encoded päringuid
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Botpressi andmed
const BOTPRESS_URL = 'https://webhook.botpress.cloud/dfb5f95a-4682-449a-bdfd-b8e33064448d';
const BOTPRESS_TOKEN = 'SINU_TURVATOKEN_SIIN'; // <-- asenda oma tokeniga

// VUBOOK webhooki endpoint
app.post('/vubook-webhook', async (req, res) => {
  const guestName = req.body.guest_name || req.body.klient || 'Külaline';
  const phoneRaw = req.body.phone || req.body.telefon || '+37256843337';
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

// Serveri käivitamine
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${PORT}`);
});

