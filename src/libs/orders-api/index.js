if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_orders, patch_orders, delete_orders } = require("./validations");
const { findAll, createOrder, updateOrder, deleteOrder } = require("./orders-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/orders", [
    jwtRequired, passUserFromJWT, adminRequired
], async (req,res) => {
    let orders = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { orders }
    })
})

app.post("/orders",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_orders)
], async (req,res) => {
    let order = await createOrder(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { order }
    })
})

app.patch("/orders/:order_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(patch_orders)
], async (req,res) => {
    let order = await updateOrder({
        pk: req.params.order_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { order }
    })
})

app.delete("/orders/:order_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_orders)
], async (req,res) => {
    await deleteOrder(req.params.order_id)
    return res.json({
        code: 204,
        message: "success"
    })
})