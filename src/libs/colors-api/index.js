if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_colors, patch_colors, delete_colors } = require("./validations");
const { findAll, createColor, updateColor, deleteColor } = require("./floor-types-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/colors", async (req,res) => {
    let colors = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { colors }
    })
})

app.post("/colors",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_colors)
], async (req,res) => {
    let color = await createColor(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { color }
    })
})

app.patch("/colors/:color_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(patch_colors)
], async (req,res) => {
    let color = await updateColor({
        pk: req.params.color_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { color }
    })
})

app.delete("/colors/:color_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_colors)
], async (req,res) => {
    await deleteColor(req.params.color_id)
    return res.json({
        code: 204,
        message: "success"
    })
})