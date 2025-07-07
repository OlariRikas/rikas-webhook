const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const qs = require('qs'); // Formaadi jaoks
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// .env muutujad
const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;
const VUBOOK_API_KEY = process.env.VUBOOK_API_KEY;
const VUBOOK_API_URL = process.env.VUBOOK_API_URL;

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
    const vubookResponse = await axios.post(
      `${VUBOOK_API_URL}/get`,
      qs.stringify({
        apikey: VUBOOK_API_KEY,
        id: reservationId
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const reservationData = vubookResponse.data;
    console.log("✅ WuBook API vastus:", reservationData);

    const phone = reservationData.guest_phone || '';
    const guest_name = reservationData.guest_name || 'Külaline';
    const checkin_date = reservationData.date_arrival || '';

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
