const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Kasuta erinevaid body parse mooduleid
app.use(bodyParser.json());                         // application/json
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(bodyParser.text());                         // text/plain

app.post('/vubook-webhook', (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');

  // Kuvame, mis täpselt tuli
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server töötab aadressil http://localhost:${PORT}`);
});
const express = require('express');
const app = express();

// Väga oluline: JSON parser tuleb enne route-de defineerimist!
app.use(express.json());

app.post('/vubook-webhook', (req, res) => {
  console.log('📥 Saabus broneering VUBOOKist:');
  console.log(JSON.stringify(req.body, null, 2));  // Ilus json log

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server töötab aadressil http://localhost:${PORT}`);
});
const express = require('express');
const app = express();
app.use(express.json());

app.post('/vubook-webhook', (req, res) => {
  console.log('Saabus POST-päring:');
  console.log(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server töötab aadressil http://localhost:${PORT}`);
});

