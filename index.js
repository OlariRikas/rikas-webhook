const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BOTPRESS_URL = 'https://webhook.botpress.cloud/dfb5f95a-4682-449a-bdfd-b8e33064448d';
const BOTPRESS_TOKEN = 'bp_pat_gs6tY0C7ftfJM4zFgREjywTQHGdREu7BOkgj';

app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  let pushData = req.body;

  // Kui push_data on olemas stringina, proovi seda parsimisega
  if (typeof req.body.push_data === 'string') {
    try {
      pushData = JSON.parse(req.body.push_data);
      console.log('📦 push_data JSON:', pushData);
    } catch (err) {
      console.error('❌ push_data JSON parsimine ebaõnnestus:', err.message);
      return res.status(400).send('Vale push_data formaat');
    }
  }

  const guestName = pushData.guest_name || 'Külaline';
  const phoneRaw = pushData.phone || '';

  // Eemalda tühikud algusest/lõpust ja vahelt
  const phone = phoneRaw.trim().replace(/\s/g, '');

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server töötab aadressil http://localhost:${PORT}`);
});

