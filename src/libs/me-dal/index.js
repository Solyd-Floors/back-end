
const { findOne: findOneCart } = require("../carts-dal");
const { createCart } = require("../carts-dal");

module.exports = {
    getUserActiveCart: async ({
        UserId, EmployeeId, not_json
    }) => {
        let cart = await findOneCart({ UserId, EmployeeId, status: "ACTIVE", not_json})
        if (!cart) cart = await createCart({UserId, EmployeeId })
        if (not_json && !(cart instanceof Object && cart.save)) {
            cart = await findOneCart({ id: cart.id, not_json: true })
        }
        return cart;
    }
}
