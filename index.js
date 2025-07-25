// ✅ Uus webhooki kood Zak Essentials API jaoks (JSON)
// Saab VUBOOKist reservation ID, toob JSON API kaudu detailid ja saadab Botpressile

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ⬇️ Botpress konfiguratsioon
const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_SECRET = process.env.BOTPRESS_SECRET; // UUS: secret signatuuri jaoks

// ⬇️ WUBOOK API (Zak Essentials JSON API)
const WUBOOK_API_URL = 'https://kapi.wubook.net/kp/reservations/fetch_one_reservation';
const WUBOOK_CUSTOMER_URL = 'https://kapi.wubook.net/kp/customers/fetch_one';
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

    const reservationResponse = await axios.post(
      WUBOOK_API_URL,
      new URLSearchParams({ id: reservationId }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': WUBOOK_API_KEY
        }
      }
    );

    const reservationData = reservationResponse.data?.data;
    console.log("🧾 Täielik WuBook vastus:", reservationResponse.data);

    if (!reservationData) {
      console.warn("⚠️ Ei leidnud broneeringu detaile WuBookist.");
    }

    const rooms = reservationData.rooms || [];
    const checkin_date = rooms[0]?.dfrom || '';

    let phone = '';
    let guest_name = 'Külaline';
    const bookerId = reservationData.booker;

    if (bookerId) {
      try {
        console.log("📞 Pärime kliendi andmeid ID-ga:", bookerId);
        const customerResponse = await axios.post(
          WUBOOK_CUSTOMER_URL,
          new URLSearchParams({ id: bookerId }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-api-key': WUBOOK_API_KEY
            }
          }
        );
        console.log("👤 Kliendi vastus:", customerResponse.data);

        const customerData = customerResponse.data?.data;

        phone = customerData?.contacts?.phone || '';
        const name = customerData?.main_info?.name || '';
        const surname = customerData?.main_info?.surname || '';
        guest_name = `${name} ${surname}`.trim() || 'Külaline';

        if (!phone) {
          console.warn("⚠️ Kliendi profiilis puudub telefoninumber.");
        }
      } catch (err) {
        console.warn("⚠️ Kliendi andmete pärimine ebaõnnestus:", err.message);
      }
    } else {
      console.warn("⚠️ Booker ID puudub, telefoni ei saa pärida.");
    }

    const bookingInfo = {
      reservation_id: reservationId,
      guest_name,
      phone,
      checkin_date
    };

    console.log("📤 Saadame Botpressile:", bookingInfo);

    // 🔐 Arvuta HMAC SHA256 signatuur
    const rawBody = JSON.stringify(bookingInfo);
    const signature = crypto
      .createHmac('sha256', BOTPRESS_SECRET)
      .update(rawBody)
      .digest('hex');

    // 📬 Saada webhook Botpressile koos x-signature päisega
    await axios.post(BOTPRESS_WEBHOOK_URL, rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature
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

