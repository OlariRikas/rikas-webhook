const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BOTPRESS_WEBHOOK = "https://webhook.botpress.cloud/af21a8a8-6e0a-4a72-a110-4f2b9c52b42f";
const VUBOOK_API_KEY = "wb_51e1c740-3b92-11eb-8a4b-001a4a5c09cf";

app.post('/vubook-webhook', async (req, res) => {
  try {
    const pushData = JSON.parse(req.body.push_data);
    const reservationId = pushData.reservation;

    console.log("📥 Uus broneering:", reservationId);

    const response = await axios.post(
      "https://kapi.wubook.net/kp/reservations/fetch_one_reservation",
      new URLSearchParams({ id: reservationId }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": VUBOOK_API_KEY,
        }
      }
    );

    const reservation = response.data.data;

    const payload = {
      phone: "+37256843337",
      booking_id: reservationId,
      guest_name: "Olari",
      checkin_date: reservation.rooms[0].dfrom
    };

    console.log("📤 Saadame Botpressile:", payload);

    await axios.post(BOTPRESS_WEBHOOK, payload, {
      headers: { "Content-Type": "application/json" }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Viga:", err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('🚀 Webhook server töötab aadressil http://localhost:3000');
});
