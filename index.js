const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Tugi JSON ja x-www-form-urlencoded päringutele
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Botpress WhatsAppi webhooki aadress
const BOTPRESS_URL = 'https://webhook.botpress.cloud/dfb5f95a-4682-449a-bdfd-b8e33064448d';
const BOTPRESS_TOKEN = ''; // jäta tühjaks, kui ei ole vaja tokenit

// VUBOOK Webhooki endpoint
app.post('/vubook-webhook', async (req, res) => {
  console.log("📥 Saabus broneering VUBOOKist:");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

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
        'Authorization': BOTPRESS_TOKEN ? `Bearer ${BOTPRESS_TOKEN}` : '',
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

