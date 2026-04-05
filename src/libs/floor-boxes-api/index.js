if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired, query_param_string_to_integer,
    body_param_string_to_integer
} = require("../../middlewares");

const { findAll, createFloorBox, updateFloorBox, deleteFloorBox, findOne } = require("./floor-boxes-dal");
const { ErrorHandler } = require("../../utils/error");

const { getFloorBoxesInfo } = require("../floor-boxes-dal");
const passUserOrGuestFromJWT = require("../../middlewares/passUserOrGuestFromJWT");

const yup = require("yup");
const { param_id, id, positive_integer_as_string } = require("../utils/validations");

let mil_type_schema = yup.number().integer().positive()

app.use(allowCrossDomain)

app.get("/floor_boxes/info", [
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            mil_type: positive_integer_as_string.required(),
            FloorId: positive_integer_as_string.required(),
        })
    })),
    query_param_string_to_integer("mil_type"),
    query_param_string_to_integer("FloorId"),
    jwtRequired, passUserOrGuestFromJWT
],async (req,res) => {
    let info = await getFloorBoxesInfo({ 
        ...req.query, 
        UserId: req.user.id
    })
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
    validateRequest(yup.object().shape({
        query: yup.object().shape({

        })
    }))
], async (req,res) => {
    res.header('Content-Range', "FloorBox */10");

    let floor_boxes = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { floor_boxes }
    })
})

app.patch("/floor_boxes/:floor_box_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    body_param_string_to_integer("mil_type"),
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema,
            price: yup.number().positive(),
            FloorId: id,
        }),
        params: yup.object().shape({
            floor_box_id: param_id.required()
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_box_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteFloorBox(req.params.floor_box_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/floor_boxes", [
    jwtRequired, passUserFromJWT, adminRequired,
    body_param_string_to_integer("mil_type"),
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema.required(),
            price: yup.number().positive().required(),
            FloorId: id.required(),
        })
    }))
], async (req,res) => {
    let floor_box = await createFloorBox(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { floor_box }
    })
})