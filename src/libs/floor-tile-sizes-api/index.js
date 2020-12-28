if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired
} = require("../../middlewares");

const { get_floor_tile_sizes, post_floor_tile_sizes, delete_floor_tile_sizes, patch_floor_tile_sizes } = require("./validations");
const { findAll, createFloorTileSize, updateFloorTileSize, deleteFloorTileSize, findOne } = require("./floor-tile-sizes-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/floor_tile_sizes/:floor_tile_size_id", async (req,res) => {
    let floor_tile_size = await findOne(req.params.floor_tile_size_id)
    return res.json({
        code: 200,
        message: "success",
        data: { floor_tile_size }
    })
})

app.get("/floor_tile_sizes", [
    validateRequest(get_floor_tile_sizes)
], async (req,res) => {
    let floor_tile_sizes = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { floor_tile_sizes }
    })
})

app.patch("/floor_tile_sizes/:floor_tile_size_id", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(patch_floor_tile_sizes)
], async (req,res) => {
    let floor_tile_size = await updateFloorTileSize({ 
        pk: req.params.floor_tile_size_id,
        data: req.body
    })
    return res.json({
        code: 204,
        message: "success",
        data: { floor_tile_size }
    })
})

app.delete("/floor_tile_sizes/:floor_tile_size_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_floor_tile_sizes)
], async (req,res) => {
    await deleteFloorTileSize(req.params.floor_tile_size_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/floor_tile_sizes", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(post_floor_tile_sizes)
], async (req,res) => {
    let floor_tile_size = await createFloorTileSize(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { floor_tile_size }
    })
})