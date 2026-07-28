const https = require('https');

const req = https.request('https://www.academiaelprofeoficial.com/api/webhook/sanity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify({ _type: 'course' })); // Fake payload
req.end();
