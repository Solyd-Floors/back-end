if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { get_floors, post_floors, delete_floors, patch_floors } = require("./validations");
const { findAll, createFloor, updateFloor, deleteFloor } = require("./floors-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/floors", validateRequest(get_floors), async (req,res) => {
    let floors = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { floors }
    })
})

app.patch("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(patch_floors)
], async (req,res) => {
    let floor = await updateFloor({ 
        pk: req.params.floor_id,
        data: req.body
    })
    return res.json({
        code: 204,
        message: "success",
        data: { floor }
    })
})

app.delete("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_floors)
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
    let floor = await createFloor(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { floor }
    })
})