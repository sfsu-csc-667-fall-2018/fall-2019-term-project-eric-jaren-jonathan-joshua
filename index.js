const express = require('express');
const app = express();
const router = require('./routes/main.js');

var port = process.env.PORT || 8096;
var http = require('http');
var server = http. createServer(app);

app.use(express.static('client'));
app.use('/', router);

if (process.env.NODE_ENV === 'development') {
    require("dotenv").config();
}

server.listen(port, function() {
    console.log('Server is running...');
});
