
const { Cart } = require("../../models");
const { ErrorHandler } = require("../../utils/error");

module.exports = {
    findOne: async pk => await Cart.findByPkOr404(pk),
    findAll: async () => await Cart.findAll(),
    discardCart: async UserId => {
        let cart = await Cart.findOne({ 
            where: { UserId, status: "ACTIVE" }
        })
        cart.status = "DISCARDED"
        await cart.save();
        return cart;
    },
    createCart: async ({ 
        UserId
     }) => {
        if (
            await Cart.findOne({ where: { UserId, status: "ACTIVE" }})
        ) throw new ErrorHandler(403, "Discard active cart to create a new one.")
        return await Cart.create({ 
            UserId
        })
     },
     updateCart: async ({pk,data}) => {
        let keys = Object.keys(data);
        let cart = await Cart.findByPkOr404(pk);
        for (let key of keys){
            cart[key] = data[key]
        }
        await cart.save();
        return cart;
    },
    deleteCart: async (pk) => await (await (await Cart.findByPkOr404(pk))).destroy()
}