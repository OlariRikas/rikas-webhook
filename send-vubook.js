const axios = require('axios');

// Simuleeritud "push_data", mida VUBOOK tavaliselt saadab
const simulatedPush = {
  push_data: JSON.stringify({
    reservation: 24021672 // Simuleeritud reservation ID
  })
};

// Saadame POST-päringu sinu lokaalsele /vubook-webhook endpointile
axios.post('http://localhost:3000/vubook-webhook', simulatedPush, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('✅ Webhook saadetud. Vastus serverilt:', res.status, res.statusText);
})
.catch(err => {
  console.error('❌ Viga webhooki saatmisel:', err.message);
});

