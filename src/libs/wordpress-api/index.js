const express = require("express");
const app = module.exports = express();

const wp_db = require("../wordpress-db");

app.get("/wp/hello", async (req,res) => {
    return res.json({ hello: true })
})