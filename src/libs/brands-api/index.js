if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_brands } = require("./validations");
const { findAll, updateBrand, deleteBrand, createBrand } = require("./brands-dal");
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

app.patch("/brands/:brand_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_brands)
], async (req,res) => {
    let brand = await updateBrand({ 
        pk: req.params.brand_id,
        name: req.body.name
    })
    return res.json({
        code: 204,
        message: "success",
        data: { brand }
    })
})

app.delete("/brands/:brand_id", [
    jwtRequired, passUserFromJWT, adminRequired,
], async (req,res) => {
    await deleteBrand(req.params.brand_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/brands", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_brands)
], async (req,res) => {
    let brand = await createBrand({ name: req.body.name })
    return res.json({
        code: 201,
        message: "success",
        data: { brand }
    })
})