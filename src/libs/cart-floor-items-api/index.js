if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_cart_floor_items, patch_cart_floor_items, delete_cart_floor_items } = require("./validations");
const { findAll, updateCartFloorItem, deleteCartFloorItem } = require("./cart-floor-items-dal");
const { ErrorHandler } = require("../../utils/error");
const { createCartFloorItem } = require("../cart-floor-items-dal");

app.use(allowCrossDomain)

app.get("/cart_floor_items", async (req,res) => {
    let cart_floor_items = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { cart_floor_items }
    })
})

app.post("/cart_floor_items",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_cart_floor_items)
], async (req,res) => {
    let cart_floor_item = await createCartFloorItem(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { cart_floor_item }
    })
})

// TODO: Think about it
// app.patch("/cart_floor_items/:cart_floor_item_id", [
//     jwtRequired, passUserFromJWT, adminRequired,
//     validateRequest(patch_cart_floor_items)
// ], async (req,res) => {
//     let cart_floor_item = await updateCartFloorItem({
//         pk: req.params.cart_floor_item_id,
//         data: req.body
//     });
//     return res.json({
//         code: 200,
//         message: "success",
//         data: { cart_floor_item }
//     })
// })

app.delete("/cart_floor_items/:cart_floor_item_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_cart_floor_items)
], async (req,res) => {
    await deleteCartFloorItem(req.params.cart_floor_item_id)
    return res.json({
        code: 204,
        message: "success"
    })
})