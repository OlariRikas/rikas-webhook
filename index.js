const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const xml2js = require('xml2js');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const VUBOOK_API_KEY = process.env.VUBOOK_API_KEY;
const VUBOOK_API_URL = process.env.VUBOOK_API_URL;
const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;
const WHATSAPP_TEMPLATE = 'booking_confirmation';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/vubook-webhook', async (req, res) => {
  console.log("📥 Saabus broneering VUBOOKist:");
  console.log("Headers:", req.headers);

  const data = req.body;
  let reservationId;

  try {
    if (typeof data.push_data === 'string') {
      const parsed = JSON.parse(data.push_data);
      reservationId = parsed.reservation;
      console.log("📦 push_data JSON:", parsed);
    } else {
      return res.status(400).send("Vigane push_data");
    }

    console.log("📡 Pärime broneeringut WuBookist...");

    const xml = `
      <?xml version="1.0"?>
      <methodCall>
        <methodName>fetch_reservation</methodName>
        <params>
          <param><value><string>${VUBOOK_API_KEY}</string></value></param>
          <param><value><int>${reservationId}</int></value></param>
        </params>
      </methodCall>
    `;

    const response = await axios.post(VUBOOK_API_URL, xml, {
      headers: { 'Content-Type': 'text/xml' }
    });

    const xmlResponse = response.data;
    let phone = '';
    let guest_name = '';
    let checkin_date = '';

    await xml2js.parseStringPromise(xmlResponse).then(parsed => {
      const fault = parsed?.methodResponse?.fault;
      if (fault) {
        console.log("❌ API veateade:", fault[0]);
      } else {
        const struct = parsed?.methodResponse?.params?.[0]?.param?.[0]?.value?.[0]?.struct?.[0];
        if (struct) {
          const members = struct.member.reduce((acc, m) => {
            acc[m.name[0]] = m.value[0];
            return acc;
          }, {});
          guest_name = members?.name?.[0]?.string?.[0] || 'Külaline';
          checkin_date = members?.arrival?.[0]?.string?.[0] || '';
          phone = members?.customer_phone?.[0]?.string?.[0] || '';
        }
      }
    });

    const payload = {
      phone,
      booking_id: reservationId,
      guest_name,
      checkin_date
    };

    console.log("📤 Saadame Botpressile:", payload);

    await axios.post(BOTPRESS_WEBHOOK_URL, payload, {
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
