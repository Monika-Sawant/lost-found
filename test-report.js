const http = require('http');

const data = JSON.stringify({
  title: 'Test',
  description: 'test',
  details: [],
  category: 'lost',
  location: 'test'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/items',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDgwMzMzMzM1YWQwMzc2YTQzOGE4ZiIsImlhdCI6MTc3NTc2NDI3NSwiZXhwIjoxNzc4MzU2Mjc1fQ.TQkw2oSKj7Vkfd1KBvVUS3qOCSl7scImthcDTH1eQNQ',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status: ' + res.statusCode, 'Body: ' + body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
