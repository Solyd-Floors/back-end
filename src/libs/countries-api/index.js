if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_countries } = require("./validations");
const { findAll, createCountry } = require("./countries-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/countries", async (req,res) => {
    let countries = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { countries }
    })
})

app.post("/countries", [
    validateRequest(post_countries),
    jwtRequired, passUserFromJWT
], async (req,res) => {
    let country = await createCountry(req.body);
    return res.json({
        code: 201,
        message: "success",
        data: { country }
    })
})