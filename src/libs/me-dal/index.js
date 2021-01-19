
const { findOne: findOneCart } = require("../carts-dal");
const { createCart } = require("../carts-dal");

module.exports = {
    getUserActiveCart: async ({
        UserId, not_json
    }) => {
        let cart = await findOneCart({ UserId, status: "ACTIVE", not_json})
        if (!cart) cart = await createCart({UserId})
        console.log(55)
        return cart;
    }    
}