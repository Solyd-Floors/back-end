
const { Cart, FloorBox } = require("../../models");
const { ErrorHandler } = require("../../utils/error");


module.exports = {
    findOne: async pk => await Cart.findByPkOr404(pk),
    findAll: async () => await Cart.findAll({ include: [ FloorBox ]}),
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