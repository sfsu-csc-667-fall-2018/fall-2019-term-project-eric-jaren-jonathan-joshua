const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

const db = require('./db');

function initialize(passport, getUserById) {
  const authenticateUser = (username, password, done) => {
    let user = {
      id: '',
      username: '',
      password: ''
    }

    db.any(`SELECT id, username, password FROM account_db`)
      .then(async results => {
        user = results.find(user => user.username === username);

        if (user == null) {
          return done(null, false, { message: 'User does not exist' });
        }

        try {
          if (await bcrypt.compare(password, user.password)) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Password incorrect' })
          }
        } catch (e) {
          return done(e)
        }
      })
  }


  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    await db.any(`SELECT id, username, password FROM account_db`)
    .then(results => {
      const user = results.find(user => user.id === id);
      return done(null, user);
    })
  });
}

module.exports = initialize