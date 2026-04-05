const mysql = require('mysql2');

let promisePool;

const getPool = () => {
    if (promisePool) return promisePool;
    if (!process.env.WP_DATABASE) {
        throw new Error("WP_DATABASE is not configured.");
    }
    promisePool = mysql.createPool(process.env.WP_DATABASE).promise();
    return promisePool;
};

module.exports = {
    execute: (...args) => getPool().execute(...args),
    query: (...args) => getPool().query(...args),
    getConnection: (...args) => getPool().getConnection(...args),
    end: (...args) => getPool().end(...args)
};
