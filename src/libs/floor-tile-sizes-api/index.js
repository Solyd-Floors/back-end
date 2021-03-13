if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired
} = require("../../middlewares");

const { findAll, createFloorTileSize, updateFloorTileSize, deleteFloorTileSize, findOne } = require("./floor-tile-sizes-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, positive_integer_as_string } = require("../utils/validations");

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
    validateRequest(yup.object().shape({
        query: yup.object().shape({

        })
    }))
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
     validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            width: yup.number().integer().positive(),
            height: yup.number().integer().positive(),
        }),
        params: yup.object().shape({
            floor_tile_size_id: param_id.required()
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_tile_size_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteFloorTileSize(req.params.floor_tile_size_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/floor_tile_sizes", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            width: yup.number().integer().positive().required(),
            height: yup.number().integer().positive().required(),
        })
    }))
], async (req,res) => {
    let floor_tile_size = await createFloorTileSize(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { floor_tile_size }
    })
})