if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const socket = require('socket.io');
const http = require('http');

const db = require('./db');

const initializePassport = require('./passport-config')
const formatMessage = require('./models/messages');

const port = process.env.PORT || 8096;
const server = http.createServer(app);
const io = socket(server);

const sessionStore = new session.MemoryStore();
const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 60000
  }
})

server.listen(port, () => {
  console.log('Server is running...');
});

initializePassport(passport);

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(__dirname));

/*
  IO HANDLER

  This sections handles the socket connection.
*/

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
})

io.on('connection', socket => {
  if (socket.request.session.passport) {
    socket.broadcast.emit('consoleMessage', 'A user has joined the chat.');

    let user = {
      passport: socket.request.session.passport,
      id: socket.id
    }
    socket.emit('userInfo', (user));
  }

  socket.on('disconnect', () => {
    if (socket.request.session.passport) {
      socket.broadcast.emit('consoleMessage', 'A user has disconnected.');
    }
  })

  // Listen incoming chats//
  socket.on('chatMessage', (message) => {
      io.emit('message', message);
  })

  socket.on('retrieveInfo', (id) => {
    db.any(`SELECT id, username, password FROM account_db`)
    .then(results => {
        user = results.find(user => user.id === id);
        socket.emit('foundInfo', user);
    })
  })
});

/*
  ROUTES

  This sections deals with the routes of the project. All requests are handled through this 
  code section here. 

*/
app.get('/lobby', checkAuthenticated, (req, res) => {
  res.render('lobby.ejs', { name: req.user.username })
})

app.get('/', checkAuthenticated, (req, res) => {
  res.redirect('/lobby');
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('index.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/lobby',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
})

app.post('/signup', checkNotAuthenticated, async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  const newUser = {
    id: Math.floor((Math.random() * 9999) + 1),
    username: req.body.username,
    password: hashedPassword
  }
  db.any(`INSERT INTO account_db (id, username, password) VALUES (${newUser.id}, '${newUser.username}', '${newUser.password}')`)
    .then(data => {
      console.log(newUser);
    })
    .catch(error => {
      console.log(error);
    })

  res.redirect('/');
})

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
})


/* 
  AUTHENTICATION

  These functions handle the authentication redirection for login.
  If a user is not logged in, it will redirect to the /login page.
*/
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}