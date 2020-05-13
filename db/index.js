const pgp = require('pg-promise')();
const port = process.env.DATABASE_URL;
const connection = pgp(port);

module.exports = connection;