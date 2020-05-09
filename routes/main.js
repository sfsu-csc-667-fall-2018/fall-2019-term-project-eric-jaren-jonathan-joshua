const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');


const users  = [];

router.get("/", (req, res) => {    
    res.sendFile(path.join(__dirname + '/index.html'));
});



router.get("/login", (req, res) => {
    console.log(req);
    db.connect()
    .then(() => {
        console.log(`Database has been connected.`);
        db.any(`SELECT id, username, password FROM account_db`)
        .then(results => {
            console.log(results);
        })
    
        .catch(error => {
            console.log(error);
        })
    })

    .catch(error => {
        console.log(error);
    })
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