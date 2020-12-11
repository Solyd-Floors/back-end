require('dotenv').config()

console.log(process.env.DATABASE_URL);

module.exports = {
  "development": 
    process.env.DATABASE_URL ? 
    {
        url: process.env.DATABASE_URL,
        "logging": true,
    } 
    :
    {
      "username": process.env.DB_USERNAME,
      "password": process.env.DB_PASSWORD,
      "database": process.env.DB_NAME,
      "host": process.env.DB_HOST,
      "dialect": process.env.DB_DIALECT,
      "logging": true,
    }
}