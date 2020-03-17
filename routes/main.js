const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (request, resource) => {
    resource.sendFile(path.join(__dirname + '/index.html'));
});

module.exports = router;