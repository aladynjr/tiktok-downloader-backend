const Pool = require('pg').Pool

const pool = new Pool({
user: 'ynqpojva',
password: 'mdtiYymWZGZbZG9pDA8H2r0jwPQKlCHK',
host: 'ella.db.elephantsql.com',
port : 5432,
database : "ynqpojva"
})

module.exports = pool;