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

// ⬇️ WUBOOK API (Zak Essentials JSON API)
const WUBOOK_API_URL = 'https://kapi.wubook.net/kp/reservations/fetch_one_reservation';
const WUBOOK_API_KEY = process.env.VUBOOK_API_KEY; // Token, nt "wb_..."

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

    const wubookResponse = await axios.post(
      WUBOOK_API_URL,
      new URLSearchParams({
        id: reservationId
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': WUBOOK_API_KEY
        }
      }
    );

    const responseData = wubookResponse.data;
    console.log("🧾 Täielik WuBook vastus:", responseData);

    if (!responseData || !responseData.data) {
      console.warn("⚠️ Ei leidnud broneeringu detaile WuBookist.");
    }

    const reservation = responseData.data || {};
    const rooms = reservation.rooms || [];

    const guest_name = reservation.id_human || 'Külaline';
    const phone = ''; // API ei sisalda otse telefoninumbrit
    const checkin_date = rooms[0]?.dfrom || '';

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
