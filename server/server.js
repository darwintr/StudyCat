const express = require('express')

const app = express()

app.get('/', function(req, res) {
  res.send('Hello Seattle\n');
});


app.listen(3001);
console.log('Listening on port 3001...');