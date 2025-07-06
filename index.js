// ✅ Täielik webhooki kood: VUBOOK -> Botpress WhatsApp
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Laeb .env faili väärtused
const app = express();

const port = process.env.PORT || 3000;

// ⬇️ Botpressi konfiguratsioon .env failist
const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Funktsioon: Pärib VUBOOKist reservation detailid
async function fetchReservationDetails(reservationId) {
  try {
    const response = await axios.post(`${process.env.VUBOOK_API_URL}/get`, {
      reservation_id: reservationId,
      api_key: process.env.VUBOOK_API_KEY
    });

    return response.data;
  } catch (error) {
    console.error("❌ Viga VUBOOK API päringul:", error.response?.data || error.message);
    return null;
  }
}

// ✅ Webhook endpoint
app.post('/vubook-webhook', async (req, res) => {
  console.log("📥 Saabus broneering VUBOOKist:");
  console.log("Headers:", req.headers);

  const data = req.body;
  let reservationId;

  try {
    // Kontrolli ja parsi push_data
    if (typeof data.push_data === 'string') {
      const parsed = JSON.parse(data.push_data);
      reservationId = parsed.reservation;
      console.log("📦 push_data JSON:", parsed);
    } else {
      return res.status(400).send("❌ push_data puudub või pole string");
    }

    // ✅ Pärime VUBOOK API-st päris andmed
    const bookingDetails = await fetchReservationDetails(reservationId);
    if (!bookingDetails) {
      return res.status(500).send('VUBOOK API viga');
    }

    const bookingInfo = {
      phone: bookingDetails.guest_phone || '+37256843337',
      booking_id: reservationId,
      guest_name: bookingDetails.guest_name || 'Külaline',
      checkin_date: bookingDetails.checkin_date || 'kuupäev puudub'
    };

    console.log("📤 Saadame Botpressile:", bookingInfo);

    // ✅ Saadame Botpressile WhatsAppi jaoks
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

// ✅ Käivitame serveri
app.listen(port, () => {
  console.log(`🚀 Webhook server töötab aadressil http://localhost:${port}`);
});
