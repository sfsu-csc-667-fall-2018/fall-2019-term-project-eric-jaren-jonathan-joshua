if (process.env.NODE_ENV === 'development') {
    require("dotenv").config();
}

const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const http = require('http');
const socket = require('socket.io');
const passport = require('passport');
const bodyParser = require('body-parser')

const formatMessage = require('./models/messages');
require('./config/passport')(passport);

const app = express();
const port = process.env.PORT || 8096;
const server = http.createServer(app);
const io = socket(server);

const db = require('./db');

const urlParser = bodyParser.urlencoded({extended: false});

app.set('view-engine', 'ejs');

app.use(express.static(' client'));
app.use(express.static(__dirname));

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

io.on('connection', socket => {
    console.log('A user has connected');
    socket.broadcast.emit('message', formatMessage('BOT Riley', 'Welcome to CardRoyale!'));

    socket.on('disconnect', () => {
        io.emit('message', formatMessage('BOT Riley', 'Welcome to CardRoyale!'));
    })

    // Listen incoming chats//
    socket.on('chatMessage', (message) => {
        io.emit('message', message);
        console.log(message);
    })
});

server.listen(port, () => {
    console.log('Server is running...');
});

app.get("/", urlParser, (req, res) => {    
    console.log(req.user);

    res.render('index.ejs', {
        viewCount: req.session.viewCount,
        username: req.user
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/lobby',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
});

app.post("/signup", urlParser, (req, res) => {
    const newUser =  {
        id: Math.floor((Math.random() * 9999) + 1),
        username: req.body.username,
        password: req.body.password
    }
    db.any(`INSERT INTO account_db (id, username, password) VALUES (${newUser.id}, '${newUser.username}', '${newUser.password}')`)
    .then(data => {
        console.log(newUser);
    })
    .catch(error => {
        console.log(error);
    })

    res.redirect('/');
});

app.get("/tests", (req, res) => {
    db.any(`INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}')`)
        .then(_ => db.any(`SELECT * FROM test_table`))
        .then(results => res.json(results))
        .catch(error => {
            console.log(error)
            res.json({ error })
        })
});

