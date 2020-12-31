if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired, query_param_string_to_integer,
    body_param_string_to_integer
} = require("../../middlewares");

const { get_floors, post_floors, delete_floors, patch_floors, get_floors_floor_id } = require("./validations");
const { findAll, createFloor, updateFloor, deleteFloor, findOne } = require("./floors-dal");
const { ErrorHandler } = require("../../utils/error");

const multer = require('multer');
const upload = multer();
const uploadFile = require("../aws/uploadFile");
const uploadMiddleware = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
])

app.use(allowCrossDomain)

app.get("/floors/:floor_id",[
    validateRequest(get_floors_floor_id)
], async (req,res) => {
    let floor = await findOne({ floor_id: req.params.floor_id, ...req.query })
    return res.json({
        code: 200,
        message: "success",
        data: { floor }
    })
})

app.get("/floors", [
    query_param_string_to_integer("min_price"),
    query_param_string_to_integer("max_price"),
    validateRequest(get_floors)
], async (req,res) => {
    let floors = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { floors }
    })
})

app.patch("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    uploadMiddleware, validateRequest(patch_floors)
], async (req,res) => {
    if (req.files) {
        if (
            req.files["thumbnail"] &&
            req.files["thumbnail"].length
        ) req.files["thumbnail"] = req.body["thumbnail_url"] = await uploadFile(req.files["thumbnail"][0]);
    }
    if (req.body.floor_tile_sizes){
        req.body.floor_tile_sizes = req.body.floor_tile_sizes.map(x => Number(x))
    }
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
    uploadMiddleware, body_param_string_to_integer("price"), 
    validateRequest(post_floors)
], async (req,res) => {
    if (req.files) {
        if (
            req.files["thumbnail"] &&
            req.files["thumbnail"].length
        ) req.files["thumbnail"] = req.body["thumbnail_url"] = await uploadFile(req.files["thumbnail"][0]);
    }
    req.body.floor_tile_sizes = req.body.floor_tile_sizes.map(x => Number(x))
    let floor = await createFloor(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { floor }
    })
})