
const yup = require("yup");
// const { Order } = require("../../models");
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

module.exports = {
    post_orders: yup.object().shape({
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
    }),
    patch_orders: yup.object().shape({
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
    }),
    delete_orders: yup.object().shape({
        params: yup.object().shape({
            order_id: param_id.required()
        })
    })
}