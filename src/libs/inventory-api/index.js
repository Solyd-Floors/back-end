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

const { post_inventory, patch_inventory } = require("./validations");
const { getInventory, addInventory, updateInventory } = require("./inventory-dal");
const { ErrorHandler } = require("../../utils/error");

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
    validateRequest(post_inventory)
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
    validateRequest(patch_inventory)
], async (req,res) => {
    let inventory = await updateInventory(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { inventory }
    })
})