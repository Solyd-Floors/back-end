if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserOrGuestFromJWT, adminRequired } = require("../../middlewares");

const { post_me_cart_remove_item, post_carts_add_floor_boxes } = require("./validations");
const { 
    getMyCartFloorItemsInfo, 
    discardCart, 
    addBoxesToCart, 
    removeBoxesFromCart,
    addBoxesToCart2, 
    removeItemFromCart
} = require("./me-dal");
const {
    getUserActiveCart, 
} = require("../me-dal")
const { ErrorHandler } = require("../../utils/error");
const { createCart } = require("../carts-dal");

app.use(allowCrossDomain)

app.get("/me/cart", [
    jwtRequired, passUserOrGuestFromJWT
], async (req,res) => {
    let cart = await getUserActiveCart({ UserId: req.user.id });
    if (!cart) cart = await createCart({
        UserId: req.user.id
    })
    return res.json({
        code: 200,
        message: "success",
        data: { cart }
    })
})

app.get("/me/cart/items/info", [
    jwtRequired, passUserOrGuestFromJWT
], async (req,res) => {
    let cart_floor_items = await getMyCartFloorItemsInfo({ UserId: req.user.id });
    return res.json({
        code: 200,
        message: "success",
        data: { my_cart_items: cart_floor_items }
    })
})

app.post("/me/cart/discard", [
    jwtRequired, passUserOrGuestFromJWT
], async (req,res) => {
    await discardCart(req.user.id);
    let cart = await createCart({
        UserId: req.user.id
    })
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

// app.post("/me/cart/add/floor_boxes", [
//     jwtRequired, passUserOrGuestFromJWT,
//     validateRequest(post_carts_add_floor_boxes)
// ], async (req,res) => {
//     let cart = await addBoxesToCart({
//         UserId: req.user.id,
//         ...req.body
//     });
//     return res.json({
//         code: 201,
//         message: "success",
//         data: { cart }
//     })
// })

app.post("/me/cart/add/floor_boxes", [
    jwtRequired, passUserOrGuestFromJWT,
    validateRequest(post_carts_add_floor_boxes)
], async (req,res) => {
    let cart = await addBoxesToCart2({
        UserId: req.user.id,
        ...req.body
    });
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

app.post("/me/cart/remove/floor_boxes", [
    jwtRequired, passUserOrGuestFromJWT,
    validateRequest(post_carts_add_floor_boxes)
], async (req,res) => {
    let cart_floor_item = await removeBoxesFromCart({
        UserId: req.user.id,
        ...req.body
    });
    return res.json({
        code: 201,
        message: "success",
        data: { cart_floor_item }
    })
})

app.post("/me/cart/remove/item", [
    jwtRequired, passUserOrGuestFromJWT,
    validateRequest(post_me_cart_remove_item)
], async (req,res) => {
    let cart = await removeItemFromCart({
        UserId: req.user.id,
        ...req.body
    })
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})