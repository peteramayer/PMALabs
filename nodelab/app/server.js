var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendfile('./views/index.html');
});

app.listen(3000);
