if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, 
    validateRequest, 
    jwtRequired, 
    passUserOrGuestFromJWT, 
    adminRequired,
    passBusinessFromJWT,
    multipleAuth
} = require("../../middlewares");

const { 
    getMyCartFloorItemsInfo, 
    discardCart, 
    addBoxesToCart, 
    removeBoxesFromCart,
    addBoxesToCart2, 
    removeItemFromCart,
    checkoutMyCart,
    findOrder,
    cancelOrder
} = require("./me-dal");
const {
    getUserActiveCart, 
} = require("../me-dal")
const { ErrorHandler } = require("../../utils/error");
const { createCart } = require("../carts-dal");

const yup = require("yup");
const { id } = require("../utils/validations");

let mil_type_schema = yup.number().integer().positive().required()

app.use(allowCrossDomain)

app.get("/me/cart", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT])
], async (req,res) => {
    let cart = await getUserActiveCart({ 
        UserId: req.business ? req.business.UserId : req.user.id, 
    });
    if (!cart) cart = await createCart({
        UserId: req.business ? req.business.UserId : req.user.id, 
    })
    return res.json({
        code: 200,
        message: "success",
        data: { cart }
    })
})

app.get("/me/cart/items/info", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT])
], async (req,res) => {
    let cart_floor_items = await getMyCartFloorItemsInfo({ 
        UserId: req.business ? req.business.UserId : req.user.id, 
     });
    return res.json({
        code: 200,
        message: "success",
        data: { my_cart_items: cart_floor_items }
    })
})

app.post("/me/cart/discard", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT])
], async (req,res) => {
    await discardCart(req.business ? req.business.UserId : req.user.id);
    let cart = await createCart({
        UserId: req.business ? req.business.UserId : req.user.id, 
    })
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

app.post("/me/cart/add/floor_boxes", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT]),
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema,
            FloorId: id.required(),
            FloorTileSizeId: id.required(),
            boxes_amount: id.required(),
        })
    }))
], async (req,res) => {
    let cart = await addBoxesToCart2({
        UserId: req.business ? req.business.UserId : req.user.id, 
        ...req.body
    });
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

app.post("/me/cart/remove/floor_boxes", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT]),
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema,
            FloorId: id.required(),
            FloorTileSizeId: id.required(),
            boxes_amount: id.required(),
        })
    }))
], async (req,res) => {
    let cart_floor_item = await removeBoxesFromCart({
        UserId: req.business ? req.business.UserId : req.user.id, 
        ...req.body
    });
    return res.json({
        code: 201,
        message: "success",
        data: { cart_floor_item }
    })
})

app.post("/me/cart/remove/item", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT]),
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            CartFloorItemId: id.required()
        })
    }))
], async (req,res) => {
    let cart = await removeItemFromCart({
        UserId: req.business ? req.business.UserId : req.user.id, 
        ...req.body
    })
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})

app.post("/me/cart/checkout", [
    jwtRequired, passBusinessFromJWT
], async (req,res) => {
    let order = await checkoutMyCart({
        UserId: req.business.UserId
    })
    return res.json({
        code: 201,
        message: "success",
        data: { order }
    })
})

app.get("/me/orders/:order_id", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT]),
], async (req,res) => {
    let UserId = req.business ? req.business.UserId : req.user.id
    let order = await findOrder({
        UserId, OrderId: req.params.order_id
    })
    return res.json({
        code: 200,
        message: "success",
        data: { order }
    })
})

app.post("/me/orders/:order_id/cancel", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT]),
], async (req,res) => {
    console.log(555)
    let UserId = req.business ? req.business.UserId : req.user.id
    let order = await cancelOrder({ UserId, OrderId: req.params.order_id })
    return res.json({
        code: 200,
        message: "success",
        data: { order }
    })
})