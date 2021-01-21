// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_businesses, patch_businesses, delete_businesses } = require("./validations");
const { findAll, createBusiness, updateBusiness, deleteBusiness } = require("./businesses-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/businesses", async (req,res) => {
    let businesses = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { businesses }
    })
})

app.post("/businesses",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_businesses)
], async (req,res) => {
    let business = await createBusiness(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { business }
    })
})

app.patch("/businesses/:business_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(patch_businesses)
], async (req,res) => {
    let business = await updateBusiness({
        pk: req.params.business_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { business }
    })
})

app.delete("/businesses/:business_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_businesses)
], async (req,res) => {
    await deleteBusiness(req.params.business_id)
    return res.json({
        code: 204,
        message: "success"
    })
})