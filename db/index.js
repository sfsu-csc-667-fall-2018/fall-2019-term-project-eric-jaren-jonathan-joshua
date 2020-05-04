const pgp = require('pg-promise')();
const port = process.env.DATABASE_URL || "postgres://postgres@localhost:5432/csc-667-uno";
const connection = pgp(port);

module.exports = connection;