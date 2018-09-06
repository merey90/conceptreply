const config = require('config');

const pgp = require('pg-promise')({
  // Initialization Options
});
console.log(config.dbConnection);
const db = pgp(config.dbConnection);

module.exports = db;