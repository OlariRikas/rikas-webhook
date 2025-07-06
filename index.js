const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/vubook-webhook', async (req, res) => {
  console.log("📥 Saabus broneering VUBOOKist:");
  console.log("Headers:", req.headers);

  const data = req.body;

  try {
    // Kui push_data on olemas ja string, parsi JSON
    if (data.push_data && typeof data.push_data === 'string') {
      const parsed = JSON.parse(data.push_data);
      console.log("📦 push_data JSON:", parsed);
    } else {
      console.log("ℹ️ push_data puudub või pole string. Täis body:", data);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Viga JSON parsimisel:', error.message);
    res.status(500).send('Serveri viga');
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook server töötab aadressil http://localhost:${port}`);
});

