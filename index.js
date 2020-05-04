const express = require('express');
const http = require('http');
const router = require('./routes/main.js'); 
const socket = require('socket.io');

const app = express();
const port = process.env.PORT || 8096;
const server = http.createServer(app);
const io = socket(server);


app.use(express.static('client'));
app.use('/', router);
app.use(express.static(__dirname));

io.on('connection', socket => {
    console.log('A client has connected');
});

if (process.env.NODE_ENV === 'development') {
    require("dotenv").config();
}

server.listen(port, () => {
    console.log('Server is running...');
});