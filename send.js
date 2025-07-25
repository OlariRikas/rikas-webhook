const crypto = require('crypto');
const axios = require('axios');

const secret = 'rikashotels2025';

const payload = {
  reservation_id: 'ABC123',
  guest_name: 'Olari Rikas',
  phone: '37256843337',
  checkin_date: '2025-07-21'
};

const rawBody = JSON.stringify(payload);

const signature = crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

console.log("✅ Prepared Signature:", signature);
console.log("📦 Request body:\n", rawBody);

axios({
  method: 'post',
  url: 'https://webhook.botpress.cloud/dfb5f95a-4682-449a-bdfd-b8e33064448d',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': signature
  },
  data: rawBody
})
.then(res => {
  console.log('✅ Success:', res.data);
})
.catch(err => {
  console.error('❌ Error:', err.response?.data || err.message);
});
