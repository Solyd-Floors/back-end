
const { Cart, CartFloorItem, Floor } = require("../../models");
const { ErrorHandler } = require("../../utils/error");
const { getCartFloorItemWithMoreInfo } = require("./utils");
const { attachCartCompatibility, attachFloorCompatibility } = require("../frontend-compat");

module.exports = {
    findOne: async ({ id, UserId, EmployeeId, status, not_json }) => {
        let where = {}
        if (UserId) where.UserId = UserId
        if (id) where.id = id
        if (EmployeeId) where.EmployeeId = EmployeeId
        if (status) where.status = status
        
        let cart = await Cart.findOne({
            where,
            include: [
                {
                    model: CartFloorItem,
                    include: [ Floor ]
                }
            ]
        })
        if (not_json) return cart
        cart = JSON.parse(JSON.stringify(cart)) 
        if (cart && cart.CartFloorItems) {
            for (let i in cart.CartFloorItems){
                cart.CartFloorItems[i] = await getCartFloorItemWithMoreInfo(cart.CartFloorItems[i])
            }
        }
        return await attachCartCompatibility({
            cart,
            decorateProduct: floor => attachFloorCompatibility({ floor })
        });
    },
    createCart: async ({ 
        UserId, EmployeeId
     }) => {
        let where = { status: "ACTIVE" }
        if (UserId) where.UserId = UserId
        if (EmployeeId) where.EmployeeId = EmployeeId
        if (
            await Cart.findOne({ where })
        ) throw new ErrorHandler(403, "Discard active cart to create a new one.")
        let cart = await Cart.create({ 
            UserId, EmployeeId,
            woo_order_id: 0
        })
        return await module.exports.findOne({ id: cart.id });

    },
    getCartWithAllItems: async ({ CartId }) => await module.exports.findOne({ id: CartId })
}
