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

