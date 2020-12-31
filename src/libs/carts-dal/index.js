
const { Cart } = require("../../models");
const { CartFloorBox, FloorBox, FloorTileSize, CartFloorItem, Floor } = require("../../models");

module.exports = {
    findOne: async ({ UserId, status }) => await Cart.findOne({
        where: { UserId, status }, include: [ 
            {
                model: CartFloorItem,
                include: [ Floor, FloorTileSize ]
            }
         ]
    }),
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
            let { FloorId, FloorTileSizeId, mil_type } = floor_box
            if (!items[FloorId]) items[FloorId] = {}
            if (!items[FloorId][FloorTileSizeId]) 
                items[FloorId][FloorTileSizeId] = {}
            if (!items[FloorId][FloorTileSizeId][mil_type]){
                items[FloorId][FloorTileSizeId][mil_type] = 1
            } else {
                items[FloorId][FloorTileSizeId][mil_type]++;
            }
        }

        console.log(items)
        return cart;
    }
}