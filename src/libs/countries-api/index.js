if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createCountry, updateCountry, deleteCountry } = require("./countries-dal");
const { ErrorHandler } = require("../../utils/error");
const yup = require("yup");

app.use(allowCrossDomain)

app.get("/countries", async (req,res) => {
    let countries = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { countries }
    })
})

app.patch("/countries/:country_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required()
        })
    }))
], async (req,res) => {
    let country = await updateCountry({ 
        pk: Number(req.params.country_id),
        name: req.body.name
    })
    return res.json({
        code: 204,
        message: "success",
        data: { country }
    })
})

app.post("/countries", [
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required()
        })
    })),
    jwtRequired, passUserFromJWT, adminRequired
], async (req,res) => {
    let country = await createCountry(req.body);
    return res.json({
        code: 201,
        message: "success",
        data: { country }
    })
})

app.delete("/countries/:country_id", [
    jwtRequired, passUserFromJWT, adminRequired,
], async (req,res) => {
    await deleteCountry(req.params.country_id);
    return res.json({
        code: 204,
        message: "success"
    })
})