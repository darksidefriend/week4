const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  login: 'daniil_savelev'
});

const options = {
  hostname: 'kodaktor.ru',
  path: '/api/chunks',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

let count = 0;

const req = https.request(options, (res) => {
  res.on('data', (chunk) => {
    count++;
    console.log(`chunk ${count}:`, chunk.toString());
  });

  res.on('end', () => {
    console.log('Количество событий data:', count);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(postData);
req.end();
