if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const {  } = require("./validations");
const { findAll } = require("./brands-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/brands", async (req,res) => {
    let brands = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { brands }
    })
})