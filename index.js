if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const socket = require('socket.io');
const http = require('http');

const db = require('./db');

const initializePassport = require('./passport-config');
const Game = require('./models/game');
let gameArray = [];

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socket(server);

const sessionStore = new session.MemoryStore();
const sessionMiddleware = session({
  store: sessionStore,
  secret: 'kobe-maguire',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 360000000
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

io.on('connection', (socket) => {
  let gameObject = new Game('1', '1', '1');
  gameArray.push(gameObject);

  if (socket.request.session.passport) {
    let user = {
      passport: socket.request.session.passport,
      id: socket.id
    }
    socket.emit('userInfo', (user));
  }

  socket.on('joinRoom', (user) => {
    socket.join(user.lobby, function () { });
    socket.broadcast.to(user.lobby).emit('consoleMessage', user.username + ' has joined the chat.');
    socket.user = user;

    db.any(`SELECT lobby_id FROM lobby_info`)
    .then (results => {
      let lobby = results.find(lobby => lobby.lobby_id === parseInt(user.lobby));
      if (!lobby) {
        db.any(`INSERT INTO lobby_info VALUES (${user.lobby})`)
        .then(() => {
          db.any(`UPDATE lobby_info SET player_list = array_append(player_list, '${user.id}') WHERE lobby_id = ${user.lobby}`)
        }) 
      } else {
        db.any(`UPDATE lobby_info SET player_list = array_remove(player_list, ${user.id})`)
        .then(() => {
          db.any(`UPDATE lobby_info SET player_list = array_append(player_list, '${user.id}') WHERE lobby_id = ${user.lobby}`)
        })
      }
    })

    db.any(`SELECT * FROM lobby_info`)
    .then(results => {
      let gameInfo = results.find(lobby => lobby.lobby_id === parseInt(user.lobby));
      console.log(gameInfo);
      io.in(user.lobby).emit('getGameInfo', gameInfo);
    })
  })

  socket.on('leaveGame', (user) => {
    db.any(`UPDATE lobby_info SET player_list = array_remove(player_list, ${user.id})`)
    io.to(user.lobby).emit('updatePlayerList');
  })

  socket.on('disconnect', () => {
    if (socket.user) socket.broadcast.to(socket.user.lobby).emit('consoleMessage', socket.user.username + ' has left the chat.');
  })

  // Listen incoming chats//
  socket.on('chatMessage', (message) => {
    io.to(message.lobby).emit('message', message);
  })

  socket.on('retrieveInfo', (id) => {
    db.any(`SELECT id, username, password FROM account_db`)
      .then(results => {
        user = results.find(user => user.id === id);
        delete user.password;
        
        socket.emit('foundInfo', user);
      })
  })
});

/*
  ROUTES

  This sections deals with the routes of the project. All requests are handled through this 
  code section here. 

*/

app.get('/', checkAuthenticated, (req, res) => {
  db.any(`SELECT player_id, lobby_id FROM lobby_assignments`)
    .then(results => {
      let user = results.find(user => user.player_id === req.user.id);
      if (user) {
        if (req.query.Lobby) {
          if (req.query.Lobby == user.lobby_id) res.render('lobby.ejs', { name: req.user.username });
          else {
            db.any(`UPDATE lobby_assignments SET (player_id, lobby_id) = (${req.user.id}, ${req.query.Lobby}) 
              WHERE (player_id, lobby_id) = (${req.user.id}, ${user.lobby_id})`)
              .then(() => {
                res.redirect('/?Lobby=' + req.query.Lobby);
              })
          }
        } else res.redirect('/?Lobby=' + user.lobby_id);
      } else {
        db.any(`INSERT INTO lobby_assignments (player_id, lobby_id) VALUES ('${req.user.id}', '1')`)
        res.redirect('/?Lobby=1');
      }
    })
    .catch(error => {
      console.log(error);
    })
})

app.get('/index', checkNotAuthenticated, (req, res) => {
  res.render('index.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/index',
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
  res.redirect('/index');
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

  res.redirect('/index');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}
