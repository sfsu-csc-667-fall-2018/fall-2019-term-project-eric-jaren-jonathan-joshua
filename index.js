const express = require('express');
const app = express();
const router = require('./routes/main.js');

var port = 8096;
var http = require('http');
var server = http. createServer(app);

app.use(express.static('client'));
app.use('/', router);

server.listen(port, function() {
    console.log('Server is running...');
});

