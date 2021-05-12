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
    cancelOrder,
    addBoxesToCart3,
    getInvoices,
    getOrders
} = require("./me-dal");
const {
    getUserActiveCart, 
} = require("../me-dal")
const { ErrorHandler } = require("../../utils/error");
const { createCart } = require("../carts-dal");

const yup = require("yup");
const { id, param_id } = require("../utils/validations");
const { createMeReview } = require("../reviews-dal");
const { updateFloorAverageRating } = require("../floors-dal");
const { updateCard } = require("../stripe");
const { findByPk: findUserByPk, updateUser } = require("../users-api/users-dal");
const { getCustomerOders } = require("../woocommerce");

let mil_type_schema = yup.number().integer().positive().required()

app.use(allowCrossDomain)

app.patch("/me/update_card", [
    jwtRequired, multipleAuth([ passBusinessFromJWT, passUserOrGuestFromJWT ]),
    validateRequest(
        yup.object().shape({
            requestBody: yup.object().shape({
                stripe_token: yup.string().required()
            })
        })
    )
], async (req,res) => {
    let user = req.user;
    if (!user) user = await findUserByPk(req.business.UserId);
    let { customer_id } = user;
    let { stripe_token } = req.body;
    await updateCard({ customer_id, stripe_token })
    return res.json({
        code: 200,
        message: "success",
        data: { success: true }
    })
})

app.post("/me/checkout/guest_to_standard_user", [
    jwtRequired, passUserOrGuestFromJWT,
    validateRequest(
        yup.object().shape({
            requestBody: yup.object().shape({
                email: yup.string().email().required(),
                password: yup.string().required(),
                first_name: yup.string().required(),
                last_name: yup.string().required(),
                phone: yup.string(),
                address: yup.string().required(),
            })
        })
    )
], async (req,res) => {
    let user = await updateUser({
        pk: req.user.id,
        data: {
            ...req.body,
            isGuest: false
        }
    })
    return res.json({
        code: 200,
        message: "success",
        data: { user }
    })
})

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

app.get("/me/invoices", [
    jwtRequired, multipleAuth([ passBusinessFromJWT, passUserOrGuestFromJWT ])
], async (req,res) => {
    let user = req.business ? req.business.User : req.user
    console.log(user,user.customer_id)
    let { customer_id, woo_customer_id } = user;
    let invoices = await getInvoices({ woo_customer_id })
    return res.json({
        code: 200,
        message: "success",
        data: { invoices } 
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
            boxes_amount: id.required(),
            variation_id: id.required(),
        })
    }))
], async (req,res) => {
    let cart = await addBoxesToCart3({
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
            line_item_id: id.required()
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
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT])
], async (req,res) => {
    let UserId = req.business ? req.business.UserId : req.user.id
    let order = await checkoutMyCart({ UserId })
    return res.json({
        code: 201,
        message: "success",
        data: { order }
    })
})

app.get("/me/orders", [
    jwtRequired, multipleAuth([passBusinessFromJWT, passUserOrGuestFromJWT]),
], async (req,res) => {
    let user = req.business ? req.business.User : req.user
    let { customer_id, woo_customer_id } = user;
    let orders = await getOrders({
        woo_customer_id
    })
    return res.json({
        code: 200,
        message: "success",
        data: { orders }
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
    let UserId = req.business ? req.business.UserId : req.user.id
    let order = await cancelOrder({ UserId, OrderId: req.params.order_id })
    return res.json({
        code: 200,
        message: "success",
        data: { order }
    })
})

app.post("/me/review/floor/:floor_id", [
    jwtRequired, passUserOrGuestFromJWT,
    validateRequest(
        yup.object().shape({
            requestBody: yup.object().shape({
                description: yup.string().required(),
                value: yup.number().integer().positive().min(0).max(10).required(),
            }),
            params: yup.object().shape({
                floor_id: param_id.required()
            })
        })
    )
], async (req,res) => {
    let { id: UserId } = req.user;
    let { floor_id: FloorId } = req.params;
    console.log(req.params)
    let review = await createMeReview({
        UserId, woo_product_id: FloorId, ...req.body
    })
    return res.json({
        code: 200,
        message: "success",
        data: { review }
    })

})