if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired
} = require("../../middlewares");

const { findAll, updateCart, deleteCart, findOne, discardCart, addBoxesToCart } = require("./carts-dal");
const { createCart } = require("../carts-dal");
const { ErrorHandler } = require("../../utils/error");
const { param_id } = require("../utils/validations");
const yup = require("yup");

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
    validateRequest(yup.object().shape({
        query: yup.object().shape({

        })
    }))
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
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().integer().positive(),
        }),
        params: yup.object().shape({
            carts_id: param_id.required()
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            carts_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteCart(req.params.cart_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/carts", [
    jwtRequired, passUserFromJWT, adminRequired,
     validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().integer().positive().required(),
        })
    }))
], async (req,res) => {
    let cart = await createCart(req.body)
    return res.json({
        code: 201,
        message: "success",
        data: { cart }
    })
})