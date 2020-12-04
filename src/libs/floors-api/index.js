if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_floors } = require("./validations");
const { findAll, createFloor, updateFloor, deleteFloor } = require("./floors-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/floors", async (req,res) => {
    let floors = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { floors }
    })
})


app.patch("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_floors)
], async (req,res) => {
    let floor_type = await updateFloor({ 
        pk: req.params.floor_id,
        name: req.body.name
    })
    return res.json({
        code: 204,
        message: "success",
        data: { floor_type }
    })
})

app.delete("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
], async (req,res) => {
    await deleteFloor(req.params.floor_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/floors", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_floors)
], async (req,res) => {
    let floor_type = await createFloor({ name: req.body.name })
    return res.json({
        code: 201,
        message: "success",
        data: { floor_type }
    })
})