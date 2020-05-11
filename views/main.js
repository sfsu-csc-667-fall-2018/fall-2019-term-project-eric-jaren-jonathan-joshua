const express = require('express');
const flash = require('express-flash');
const router = express.Router();
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt'); 

const passport = require('passport'); 

router.use(flash());

const db = require('../db');
const urlParser = bodyParser.urlencoded({extended: false});
const initializePassport = require('../config/passport.js');
initializePassport(passport, username => {
    console.log('hello');
    db.any(`SELECT id, username, password FROM account_db`)
        .then(results => {
            console.log(results);
            results.find(user => user.username === username)
        })
    
        .catch(error => {
            console.log(error);
        })
})  

router.get("/", urlParser, (req, res) => {    
    console.log(req.user);

    res.render('index.ejs', {
        viewCount: req.session.viewCount,
        username: 'req.user.username'
    });
});

router.get("/lobby", urlParser, (req, res) => {    
    res.render('index.ejs', {
        user  :req.body.username
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
  }))

router.post("/signup", urlParser, (req, res) => {
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

router.get("/tests", (req, res) => {
    db.any(`INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}')`)
        .then(_ => db.any(`SELECT * FROM test_table`))
        .then(results => res.json(results))
        .catch(error => {
            console.log(error)
            res.json({ error })
        })
});



module.exports = router;