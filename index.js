const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Middleware andme kehade jaoks
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

// Webhook endpoint
app.post('/vubook-webhook', (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');

  // Trükime päised ja keha logidesse
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  res.sendStatus(200);
});

// Serveri käivitamine
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server töötab aadressil http://localhost:${PORT}`);
});

