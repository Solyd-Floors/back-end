if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired, query_param_string_to_integer
} = require("../../middlewares");

const { get_floor_boxes_info, get_floor_boxes, post_floor_boxes, delete_floor_boxes, patch_floor_boxes } = require("./validations");
const { findAll, createFloorBox, updateFloorBox, deleteFloorBox, findOne } = require("./floor-boxes-dal");
const { ErrorHandler } = require("../../utils/error");

const { getFloorBoxesInfo } = require("../floor-boxes-dal")

app.use(allowCrossDomain)

app.get("/floor_boxes/info", [
    validateRequest(get_floor_boxes_info),
    query_param_string_to_integer("mil_type"),
    query_param_string_to_integer("FloorId"),
    query_param_string_to_integer("FloorTileSizeId"),
],async (req,res) => {
    let info = await getFloorBoxesInfo(req.query)
    return res.json(info)
})

app.get("/floor_boxes/:floor_box_id", async (req,res) => {
    let floor_box = await findOne(req.params.floor_box_id)
    return res.json({
        code: 200,
        message: "success",
        data: { floor_box }
    })
})

app.get("/floor_boxes", [
    validateRequest(get_floor_boxes)
], async (req,res) => {
    let floor_boxes = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { floor_boxes }
    })
})

app.patch("/floor_boxes/:floor_box_id", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(patch_floor_boxes)
], async (req,res) => {
    let floor_box = await updateFloorBox({ 
        pk: req.params.floor_box_id,
        data: req.body
    })
    return res.json({
        code: 204,
        message: "success",
        data: { floor_box }
    })
})

app.delete("/floor_boxes/:floor_box_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_floor_boxes)
], async (req,res) => {
    await deleteFloorBox(req.params.floor_box_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/floor_boxes", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(post_floor_boxes)
], async (req,res) => {
    let floor_box = await createFloorBox(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { floor_box }
    })
})