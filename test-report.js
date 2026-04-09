require('dotenv').config({ path: '.env' });
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/items',
  method: 'GET',
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const items = JSON.parse(body);
    console.log('First item full JSON:');
    console.log(JSON.stringify(items[0], null, 2));
  });
});

req.on('error', error => console.error(error));
req.end();
