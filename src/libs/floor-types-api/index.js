if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const {  } = require("./validations");
const { findAll } = require("./floor-types-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/floor_types", async (req,res) => {
    let floor_types = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { floor_types }
    })
})