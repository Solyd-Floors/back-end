
const { findOne: findOneCart } = require("../carts-dal");
const { createCart } = require("../carts-dal");
const { findOrderById, findProductByPkOr404 } = require("../woocommerce");

module.exports = {
    getUserActiveCart: async ({
        UserId, EmployeeId, not_json
    }) => {
        let cart = await findOneCart({ UserId, EmployeeId, status: "ACTIVE", not_json})
        if (!cart) cart = await createCart({UserId, EmployeeId })
        if (!cart.woo_order && !not_json){
            let { woo_order_id } = cart;
            cart = JSON.parse(JSON.stringify(cart));
            cart.woo_order = await findOrderById(woo_order_id)
            cart.woo_order.line_items = await Promise.all(
                cart.woo_order.line_items.map(async line_item => {
                    line_item.product = await findProductByPkOr404(line_item.product_id);
                    return line_item;
                })
            )
        }
        return cart;
    }
}