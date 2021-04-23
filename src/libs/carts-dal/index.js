
const { Cart } = require("../../models");
const { CartFloorBox, FloorBox, CartFloorItem, Floor } = require("../../models");
const { ErrorHandler } = require("../../utils/error");
const getPrice = require("../../utils/getPrice");
const { getCartFloorItemWithMoreInfo } = require("./utils");

module.exports = {
    findOne: async ({ id, UserId, EmployeeId, status, not_json }) => {
        let where = {}
        if (UserId) where.UserId = UserId
        if (id) where.id = id
        if (EmployeeId) where.EmployeeId = EmployeeId
        if (status) where.status = status
        console.log({where})
        let cart = await Cart.findOne({
            where, include: [ 
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
        // await Promise.all(cart.CartFloorItems)
        // console.log(cart.CartFloorItems,"cart.CartFloorItems")
        return cart;
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
        return await Cart.create({ 
            UserId, EmployeeId
        })
    },
    getCartWithAllItems: async ({
        CartId
    }) => {
        let cart = await Cart.findByPkOr404(CartId);
        let cart_floor_boxes = await CartFloorBox.findAll({
            where: { CartId }, include: FloorBox
        })

        let items = {}
        for (let cart_floor_box of cart_floor_boxes){
            let floor_box = cart_floor_box.FloorBox;
            let { FloorId, mil_type } = floor_box
            if (!items[FloorId]) items[FloorId] = {}
            if (!items[FloorId][mil_type]){
                items[FloorId][mil_type] = 1
            } else {
                items[FloorId][mil_type]++;
            }
        }

        console.log(items)
        return cart;
    }
}