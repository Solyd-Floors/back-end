const mysql = require('mysql2');
 
const pool = mysql.createPool(process.env.WP_DATABASE);
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();

module.exports = promisePool