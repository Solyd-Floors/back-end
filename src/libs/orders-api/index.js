if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createOrder, updateOrder, deleteOrder } = require("./orders-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

let Order = function(){}
Order.get_status_list = () => [
    "WAITING_CONFIRMATION",
    "CONFIRMED",
    "SHIPPING",
    "DELIVERED",
    "CANCELED",
    "REFUSED"
]

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
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            status: yup.array().oneOf(
                Order.get_status_list()
            ).required(),
            UserId: id.required(),
            CartId: id.required(),
            InvoiceId: id.required(),
            InstallationId: id,
            ShipToAddressId: id,
        })
    }))
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
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            status: yup.array().oneOf(
                Order.get_status_list()
            ),
            UserId: id,
            CartId: id,
            InvoiceId: id,
            InstallationId: id,
            ShipToAddressId: id,
        }),
        params: yup.object().shape({
            order_id: param_id.required()
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            order_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteOrder(req.params.order_id)
    return res.json({
        code: 204,
        message: "success"
    })
})