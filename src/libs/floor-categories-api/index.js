if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const {  } = require("./validations");
const { findAll } = require("./floor-categories-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/floor_categories", async (req,res) => {
    let floor_categories = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { floor_categories }
    })
})