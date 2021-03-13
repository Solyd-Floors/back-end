// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, 
    validateRequest, 
    jwtRequired, 
    passUserFromJWT, 
    adminRequired,
    body_param_string_to_integer
} = require("../../middlewares");

const { getInventory, addInventory, updateInventory } = require("./inventory-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id, positive_integer_as_string } = require("../utils/validations");

let mil_type_schema = yup.number().integer().positive()

let post_inventory_shape = yup.object().shape({
    mil_type: mil_type_schema.required(),
    price: yup.number().positive().required(),
    FloorId: id.required(),
    FloorTileSizeId: id.required(),
    amount: yup.number().positive().required(),
})

app.use(allowCrossDomain)

app.get("/inventory", [
    jwtRequired, passUserFromJWT, adminRequired,
], async (req,res) => {
    let inventory = await getInventory();
    return res.json({
        code: 200,
        message: "success",
        data: { inventory }
    })
})

app.post("/inventory",[
    jwtRequired, passUserFromJWT, adminRequired,
    body_param_string_to_integer("mil_type"),
    body_param_string_to_integer("amount"),
    validateRequest(yup.object().shape({
        requestBody: post_inventory_shape
    }))
], async (req,res) => {
    let inventory = await addInventory(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { inventory }
    })
})

app.patch("/inventory",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            before: post_inventory_shape,
            after: post_inventory_shape
        })
    }))
], async (req,res) => {
    let inventory = await updateInventory(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { inventory }
    })
})