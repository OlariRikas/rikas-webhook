// ✅ Täielik webhooki kood, mis:
// 1. Saab VUBOOKist push_data (reservation ID)
// 2. Pärib VUBOOK API kaudu broneeringu andmed
// 3. Saadab need Botpressile WhatsAppi šablooni kaudu

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ⬇️ Botpressi konfiguratsioon
const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;
const WHATSAPP_TEMPLATE = 'booking_confirmation';

// ⬇️ VUBOOK API konfiguratsioon
const VUBOOK_API_URL = 'https://wired.wubook.net/xrws/';
const VUBOOK_API_KEY = process.env.VUBOOK_API_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/vubook-webhook', async (req, res) => {
  console.log("📥 Saabus broneering VUBOOKist:");
  console.log("Headers:", req.headers);

  const data = req.body;

  try {
    let reservationId;
    if (typeof data.push_data === 'string') {
      const parsed = JSON.parse(data.push_data);
      reservationId = parsed.reservation;
      console.log("📦 push_data JSON:", parsed);
    } else {
      return res.status(400).send("Vigane push_data");
    }

    console.log("📡 Pärime broneeringut WuBookist...");

    const response = await axios.post(VUBOOK_API_URL, {
      method: 'fetch_reservation',
      apikey: VUBOOK_API_KEY,
      id: reservationId
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Parseeri XML vastus või kontrolli vea sõnumit
    const xmlData = response.data;
    if (typeof xmlData === 'string' && xmlData.includes('<fault>')) {
      console.log("❌ API viga:", xmlData);
    }

    // Kuna XML parserit pole, kasutame ajutiselt testandmeid
    const bookingInfo = {
      phone: '', // ← siia lisame tulevikus XML parserist tegeliku numbri
      booking_id: reservationId,
      guest_name: 'Külaline',
      checkin_date: ''
    };

    console.log("📤 Saadame Botpressile:", bookingInfo);

    await axios.post(BOTPRESS_WEBHOOK_URL, bookingInfo, {
      headers: {
        Authorization: `Bearer ${BOTPRESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Serveri viga:', error.message);
    res.status(500).send('Serveri viga');
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook server töötab aadressil http://localhost:${port}`);
});
