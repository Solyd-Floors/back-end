if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired
} = require("../../middlewares");

const { get_carts, post_carts, delete_carts, patch_carts } = require("./validations");
const { findAll, createCart, updateCart, deleteCart, findOne, discardCart } = require("./carts-dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

app.get("/carts/:cart_id", async (req,res) => {
    let cart = await findOne(req.params.cart_id)
    return res.json({
        code: 200,
        message: "success",
        data: { cart }
    })
})

app.get("/carts", [
    validateRequest(get_carts)
], async (req,res) => {
    let carts = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { carts }
    })
})

app.patch("/carts/:cart_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(patch_carts)
], async (req,res) => {
    let cart = await updateCart({ 
        pk: req.params.cart_id,
        data: req.body
    })
    return res.json({
        code: 204,
        message: "success",
        data: { cart }
    })
})

app.delete("/carts/:cart_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_carts)
], async (req,res) => {
    await deleteCart(req.params.cart_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/carts", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(post_carts)
], async (req,res) => {
    let cart = await createCart(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

app.post("/carts/discard", [
    jwtRequired, passUserFromJWT, adminRequired,
], async (req,res) => {
    let cart = await discardCart(req.user.id);
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

// app.post("/carts/add/floor_boxes", [
//     jwtRequired, passUserFromJWT, adminRequired,
//     validateRequest(post_carts_add_floor_boxes)
// ], async (req,res) => {
//     let cart = await discardCart(req.user.id);
//     return res.json({
//         code: 201,
//         message: "success",
//         data: { cart }
//     })
// })

// app.get("/test", async (req,res) => {
//     let floor_boxes = await FloorBox.findAll({
//         where: { mil_type: 12, FloorId: 1 }
//     })
//     let square_feet_available = floor_boxes.length * 23.4
//     return res.json({
//         pallets: Math.floor(floor_boxes.length / 50),
//         boxes: floor_boxes.length,
//         square_feet_available,
//     })
// })