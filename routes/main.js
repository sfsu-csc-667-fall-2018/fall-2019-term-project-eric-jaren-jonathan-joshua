const express = require("express");
const router = express.Router();
const db = require('../db');
const path = require('path');

router.get("/", (request, response) => {
    response.sendFile(path.join(__dirname + '/index.html'));
});

router.get("/tests", (request, response) => {
    db.any(`INSERT INTO test_table ("testString") VALUES ('Hello at ${Date.now()}')`)
        .then(_ => db.any(`SELECT * FROM test_table`))
        .then(results => response.json(results))
        .catch(error => {
            console.log(error)
            response.json({ error })
        })
})

router.post('/signup', (request, response) => {
    
});

function validUser(user) {
    const validEmail = typeof user.email == 'string' && user.email.trim() != '';
    const validPassword = typeof user.email == 'string' && user.email.trim() != '' && user.password.trim().length >= 6;

    return validEmail && validPassword;
}

module.exports = router;