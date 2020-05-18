if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express'); 
const app = express();
const bcrypt = require('bcrypt'); //used to hash passwords
const passport = require('passport'); //
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const socket = require('socket.io'); 
const http = require('http');

const db = require('./db');

const initializePassport = require('./passport-config');

const port = process.env.PORT || 8096;
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
  if (socket.request.session.passport) {
    let user = {
      passport: socket.request.session.passport,
      id: socket.id
    }
    socket.emit('userInfo', (user));
  }

  socket.on('disconnect', () => {
    if (socket.user) socket.broadcast.to(socket.user.lobby).emit('consoleMessage', socket.user.username + ' has left the chat.');
  })

  socket.on('joinRoom', (user) => {
    socket.join(user.lobby, function () { });
    socket.broadcast.to(user.lobby).emit('consoleMessage', user.username + ' has joined the chat.');
    socket.user = user;

    db.any(`SELECT * FROM lobby_info`)
      .then(results => {
        let gameInfo = results.find(gameInfo => gameInfo.lobby_id === parseInt(user.lobby));
        if (gameInfo) io.to(user.lobby).emit('getGameInfo', gameInfo);
      })
  })

  socket.on('joinGame', (user) => {
    db.any(`SELECT lobby_id FROM lobby_info`)
      .then(results => {
        let lobby = results.find(lobby => lobby.lobby_id === parseInt(user.lobby));
        if (!lobby) {
          db.any(`INSERT INTO lobby_info VALUES (${user.lobby})`)
            .then(() => {
              db.any(`UPDATE lobby_info SET player_list = array_append(player_list, '${user.id}') WHERE lobby_id = ${user.lobby}`)
                .then(() => {
                  db.any(`SELECT * FROM lobby_info`)
                    .then(results => {
                      let gameInfo = results.find(lobby => lobby.lobby_id === parseInt(user.lobby));
                      io.to(gameInfo.lobby_id).emit('getGameInfo', gameInfo);
                    })
                })
            })
        } else {
          db.any(`UPDATE lobby_info SET player_list = array_append(player_list, '${user.id}') WHERE lobby_id = ${user.lobby}`)
            .then(() => {
              db.any(`SELECT * FROM lobby_info`)
                .then(results => {
                  let gameInfo = results.find(lobby => lobby.lobby_id === parseInt(user.lobby));
                  io.to(gameInfo.lobby_id).emit('getGameInfo', gameInfo);
                })
            })
        }
      })
  })

  socket.on('forceUpdate', (user) => {
    db.any(`SELECT * FROM lobby_${user.lobby}`)
      .then(results => {
        db.any(`SELECT * FROM lobby_info`)
          .then((results2) => {
            let lobby = results2.find(lobby => lobby.lobby_id === parseInt(user.lobby));
            io.to(user.lobby).emit('updateGame', { gameInfo: lobby, deck: results });
          })
      })
  })

  socket.on('leaveGame', (user) => {
    db.any(`UPDATE lobby_info SET player_list = array_remove(player_list, ${user.id}) WHERE lobby_id = ${user.lobby}`)
      .then(() => {
        db.any(`SELECT * FROM lobby_info`)
          .then(results => {
            let gameInfo = results.find(gameInfo => gameInfo.lobby_id === parseInt(user.lobby));
            io.to(gameInfo.lobby_id).emit('getGameInfo', gameInfo);
          })
      })
  })

  socket.on('changeGameState', (lobby) => {
    db.any(`UPDATE lobby_info SET game_state = ${lobby.game_state}
    WHERE lobby_id = ${lobby.lobby_id}`)
      .then(() => {
        if (lobby.game_state == 0) {
          db.any(`TRUNCATE TABLE lobby_${lobby.lobby_id}`)
            .then(() => {
              db.any(`SELECT * FROM lobby_info`)
                .then(results => {
                  let gameInfo = results.find(gameInfo => gameInfo.lobby_id === parseInt(lobby.lobby_id));
                  io.to(gameInfo.lobby_id).emit('getGameInfo', gameInfo);
                })
            })
        } else {
          let newDraw = Math.floor((Math.random() * 39) + 0);
          db.any(`INSERT INTO lobby_${lobby.lobby_id} (card_id, player_id) VALUES (${newDraw}, '0')`)
            .then(() => {
              db.any(`UPDATE lobby_info SET turn = ${0} WHERE lobby_id = ${lobby.lobby_id}`)
                .then(() => {
                  db.any(`SELECT * FROM lobby_info`)
                    .then(results => {
                      let gameInfo = results.find(gameInfo => gameInfo.lobby_id === parseInt(lobby.lobby_id));
                      for (let i = 0; i < gameInfo.player_list.length; i++) {
                        for (let j = 0; j < 7; j++) {
                          newDraw = Math.floor((Math.random() * 49) + 0);
                          db.any(`INSERT INTO lobby_${lobby.lobby_id} (card_id, player_id) VALUES
                          (${newDraw}, ${gameInfo.player_list[i]})`)
                            .then(() => {
                              io.to(gameInfo.lobby_id).emit('getGameInfo', gameInfo);
                            })
                        }
                      }
                    })
                })
            })
        }
      })
  })

  socket.on('drawCard', (user) => {
    let newDraw = Math.floor((Math.random() * 49) + 0);
    db.any(`INSERT INTO lobby_${user.lobby} (card_id, player_id) VALUES (${newDraw}, ${user.id})`)
      .then(() => {
        db.any(`SELECT * FROM lobby_info`)
          .then((results) => {
            let lobby = results.find(lobby => lobby.lobby_id === parseInt(user.lobby))
            if (lobby.turn == lobby.player_list.length - 1) db.any(`UPDATE lobby_info SET turn = ${0} WHERE lobby_id = ${user.lobby}`)
            else db.any(`UPDATE lobby_info SET turn = ${lobby.turn + 1} WHERE lobby_id = ${user.lobby}`)
            db.any(`SELECT * FROM lobby_${user.lobby}`)
              .then(results => {
                db.any(`SELECT * FROM lobby_info`)
                  .then((results2) => {
                    let lobby = results2.find(lobby => lobby.lobby_id === parseInt(user.lobby));
                    io.to(user.lobby).emit('updateGame', { gameInfo: lobby, deck: results });
                  })
              })
          })
      })
  })

  socket.on('endTurn', (user) => {
    db.any(`SELECT * FROM lobby_${user.lobby}`)
      .then((results) => {
        let discard = results.find(discard => discard.player_id === 0);
        if (verifyDiscard(user.discardCard, discard.card_id) || verifyDiscard(discard.card_id, user.discardCard)) {
          db.any(`DELETE FROM lobby_${user.lobby} WHERE player_id = ${0}`)
            .then(() => {
              db.any(`INSERT INTO lobby_${user.lobby} (card_id, player_id) VALUES (${user.discardCard}, ${0})`)
                .then(() => {
                  db.any(`DELETE FROM lobby_${user.lobby} WHERE (card_id, player_id) = (${user.discardCard}, ${user.id})`)
                    .then(() => {
                      db.any(`SELECT * FROM lobby_${user.lobby} WHERE player_id = ${user.id}`)
                        .then((results) => {
                          let winner = results.find(winner => winner.player_id = user.id);
                          if (winner) {
                            db.any(`SELECT * FROM lobby_info`)
                              .then((results) => {
                                let lobby = results.find(lobby => lobby.lobby_id === parseInt(user.lobby))
                                if (lobby.turn == lobby.player_list.length - 1) db.any(`UPDATE lobby_info SET turn = ${0} WHERE lobby_id = ${user.lobby}`)
                                else db.any(`UPDATE lobby_info SET turn = ${lobby.turn + 1} WHERE lobby_id = ${user.lobby}`)
                                db.any(`SELECT * FROM lobby_${user.lobby}`)
                                  .then(results => {
                                    db.any(`SELECT * FROM lobby_info`)
                                      .then((results2) => {
                                        let lobby = results2.find(lobby => lobby.lobby_id === parseInt(user.lobby));
                                        io.to(user.lobby).emit('updateGame', { gameInfo: lobby, deck: results });
                                      })
                                  })
                              })
                          } else io.to(socket.id).emit('gameWinner', user);
                        })
                    })
                })
            })
        }
      })
  })

  // Listen incoming chats//
  socket.on('chatMessage', (message) => {
    io.in(message.lobby).emit('message', message);
  })

  socket.on('globalChatMessage', (message) => {
    io.emit('globalMessage', message);
  })

  socket.on('retrieveInfo', (id) => {
    db.any(`SELECT id, username, password FROM account_db`)
      .then(results => {
        user = results.find(user => user.id === id);
        delete user.password;

        socket.emit('foundInfo', user);
      })
  })

  socket.on('findUserById', id => {
    db.any(`SELECT id, username FROM account_db`)
      .then((results) => {
        user = results.find(user => user.id === id);
        io.to(socket.id).emit('foundUsername', user);
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

/*

  GAME FUNCTIONS

*/

function verifyDiscard(card1, card2) {
  if (card1 == 48 || card1 == 49 || card2 == 48 || card2 == 49) return true;

  a = normalizeCard(card1);
  b = normalizeCard(card2);

  if (a.value == b.value) return true;
  else if (a.color == b.color) return true;
  else return false;
}

function normalizeCard(card) {
  let normalizedCard = {
    color: '',
    value: ''
  };

  if (card < 10 || card == 40 || card == 41) { normalizedCard.color = 'Red'; }
  else if (card < 20 || card == 42 || card == 43) { normalizedCard.color = 'Yellow'; }
  else if (card < 30 || card == 44 || card == 45) { normalizedCard.color = 'Green'; }
  else if (card < 40 || card == 46 || card == 47) { normalizedCard.color = 'Blue'; }

  if (card < 40) normalizedCard.value = card % 10;
  else if (card == 40 || card == 42 || card == 44 || card == 46) normalizedCard.value = 11;
  else if (card == 41 || card == 43 || card == 45 || card == 47) normalizedCard.value = 12;

  return normalizedCard;
}
