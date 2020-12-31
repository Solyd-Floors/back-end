
const { CartFloorItem } = require("../../models");

module.exports = {
    findOne: async data => {
        let data_keys = ["CartId", "mil_type", "boxes_amount", "FloorTileSizeId", "FloorId"]
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
    findAll: async ({
        CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
    }) => await CartFloorItem.findAll({ 
        where: { CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId }
    }),
    createCartFloorItem: async ({ 
        CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
     }) => await CartFloorItem.create({ 
        CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
    }),
    deleteCartFloorItem: async ({
        CartId, CartFloorItemId
    }) => {
        let cart_floor_item = await CartFloorItem.findOne({ CartId, CartFloorItemId });
        await cart_floor_item.destroy();
        return cart_floor_item;
    },
    removeBoxesFromCartFloorItem: async ({
        CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
    }) => {
        let cart_floor_item = await CartFloorItem.findOne({
            where: { CartId, mil_type, FloorTileSizeId, FloorId }
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