const express = require('express');
const http = require('http');
const router = require('./routes/main.js'); 
const socket = require('socket.io');

const Sequelize = require('sequelize');

const app = express();
const port = process.env.PORT || 8096;
const server = http.createServer(app);
const io = socket(server);


app.use(express.static(' client'));
app.use('/', router);
app.use(express.static(__dirname));

io.on('connection', socket => {
    socket.broadcast.emit('message', 'A new user has joined the chat!');

    socket.on('disconnect', () => {
        io.emit('message', 'A user has disconnected...');
    })

    // Listen incoming chats//
    socket.on('chatMessage', (message) => {
        io.emit('message', message);
        console.log(message);
    })
});

if (process.env.NODE_ENV === 'development') {
    require("dotenv").config();
}

server.listen(port, () => {
    console.log('Server is running...');
});