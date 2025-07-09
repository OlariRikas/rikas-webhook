// ✅ Uus webhooki kood Zak Essentials API jaoks (JSON)
// Saab VUBOOKist reservation ID, toob JSON API kaudu detailid ja saadab Botpressile

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ⬇️ Botpress konfiguratsioon
const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;
const WHATSAPP_TEMPLATE = 'booking_confirmation';

// ⬇️ VUBOOK API (Zak Essentials JSON API)
const VUBOOK_API_URL = 'https://kapi.wubook.net/kp/reservations';
const VUBOOK_API_KEY = process.env.VUBOOK_API_KEY; // Token, nt "wb_..."
const VUBOOK_LCODE = 0; // ← Kui vajad erinevat lcode'i, muuda siit

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

    // Pärime broneeringu JSON API kaudu koos apy-key päisega
    const wubookResponse = await axios.post(
      VUBOOK_API_URL,
      {
        lcode: VUBOOK_LCODE,
        token: VUBOOK_API_KEY,
        rid: reservationId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'apy-key': VUBOOK_API_KEY
        }
      }
    );

    const responseData = wubookResponse.data;

    // 🔍 Lisa täielik logimine
    console.log("🧾 Täielik WuBook vastus:", JSON.stringify(responseData, null, 2));

    if (!responseData || !responseData.reservation) {
      console.warn("⚠️ Ei leidnud broneeringu detaile WuBookist.");
    }

    const reservation = responseData.reservation || {};

    const guest_name = reservation.guest_name || 'Külaline';
    const phone = reservation.phone || '';
    const checkin_date = reservation.date_arrival || '';

    const bookingInfo = {
      phone,
      booking_id: reservationId,
      guest_name,
      checkin_date
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
