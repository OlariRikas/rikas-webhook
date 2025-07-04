const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.post('/vubook-webhook', async (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  const guestName = req.body.guest_name || 'Külaline';
  const phone = req.body.phone || '+37255555555'; // ← TESTI NUMBER, vajadusel muuda

  const message = {
    phone: phone,
    text: `Tere, ${guestName}! Täname sind broneeringu eest. Kui vajad soovitusi linnas või abi, anna julgelt teada.`
  };

  try {
    await axios.post('https://webhook.botpress.cloud/7e5334c1-07d2-4070-83ed-7d897b5d2fda', message, {
      headers: {
        Authorization: 'Bearer bp_pat_KPBXgMopcYsa46jwuSPKaeKCyi4Zmv1rOonW',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ WhatsAppi sõnum saadetud läbi Botpressi');
  } catch (error) {
    console.error('❌ WhatsAppi saatmine ebaõnnestus:', error.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server töötab aadressil http://localhost:${PORT}`);
});

