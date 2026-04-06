
const { CartFloorItem } = require("../../models");
const { ErrorHandler } = require("../../utils/error");

module.exports = {
    findOne: async data => {
        let data_keys = ["CartId", "mil_type", "boxes_amount", "FloorId"]
        let where = {}
        data_keys.map( key => data[key] ? where[key] = data[key] : null)
        console.log({where})
        return await CartFloorItem.findOne({
            where
        })
    },
    findAllForCart: async ({ CartId }) => await CartFloorItem.findAll({
        where: { CartId }
    }),
    findAllForCartWhere: async (CartId, { where }) => await CartFloorItem.findAll({
        where: { CartId, ...where }
    }),
    findAll: async ({
        CartId, mil_type, boxes_amount, FloorId 
    }) => await CartFloorItem.findAll({ 
        where: { CartId, mil_type, boxes_amount, FloorId }
    }),
    createCartFloorItem: async ({ 
        CartId, mil_type, boxes_amount, FloorId 
     }) => await CartFloorItem.create({ 
        CartId, mil_type, boxes_amount, FloorId 
    }),
    deleteCartFloorItem: async ({
        CartId, CartFloorItemId
    }) => {
        let cart_floor_item = await CartFloorItem.findOne({ where: { CartId, id: CartFloorItemId } });
        if (!cart_floor_item) {
            throw new ErrorHandler(404, "Cart item not found", [ "Cart item not found." ]);
        }
        await cart_floor_item.destroy();
        return cart_floor_item;
    },
    removeBoxesFromCartFloorItem: async ({
        CartId, mil_type, boxes_amount, FloorId 
    }) => {
        let cart_floor_item = await CartFloorItem.findOne({
            where: { CartId, mil_type, FloorId }
        })
        if (!cart_floor_item) return false;
        let updated_amount = cart_floor_item.boxes_amount - boxes_amount;
        if (updated_amount <= 0) {
            await cart_floor_item.destroy();
            return { removed: true }
        }
        cart_floor_item.boxes_amount = updated_amount;
        await cart_floor_item.save();
        return cart_floor_item
    }
}
