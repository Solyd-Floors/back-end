
const { findOne: findOneCart } = require("../carts-dal");
const { createCart } = require("../carts-dal");

module.exports = {
    getUserActiveCart: async ({
        UserId, EmployeeId, not_json
    }) => {
        let cart = await findOneCart({ UserId, EmployeeId, status: "ACTIVE", not_json})
        if (!cart) cart = await createCart({UserId, EmployeeId })
        console.log(55)
        return cart;
    }    
}