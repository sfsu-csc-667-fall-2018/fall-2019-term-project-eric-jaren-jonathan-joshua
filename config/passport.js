const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
                db.any(`SELECT id, username, password FROM account_db`)
                    .then(results => {
                        console.log(results);
                        const user = results.find(user => user.username === username)
                        
                        if (user == null) {
                            return done(null, false, {message: 'User does not exist'}); 
                        } else return done(null, user);
                    })
                
                    .catch(error => {
                        console.log(error);
                    })
            })  
    )

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
};