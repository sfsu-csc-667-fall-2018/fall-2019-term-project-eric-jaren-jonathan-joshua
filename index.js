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

const db = require('./db');

const initializePassport = require('./passport-config')

initializePassport(passport);

const users = [{ id: 7034, username: 'Kristine', password: '$2b$10$TNbWtmWf927cOV2/ybfn..Exys1y0/0uefVvvyI52bOWd2RueEILy'}];

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static(__dirname));

app.get('/', checkAuthenticated, (req, res) => {
  res.render('lobby.ejs', { name: req.user.username })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('index.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/signup', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
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
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(8096)