
const { FloorBox, Floor, Sequelize } = require("../../models");
const { findOne: findOneCartFloorItem } = require("../cart-floor-items-dal");
const { getUserActiveCart } = require("../me-dal");

module.exports = {
    getFloorBoxesInfo: async ({
        mil_type, FloorId, FloorTileSizeId, limit, exclude_ids, cart, UserId
    }) => {
        let where = { 
            mil_type, FloorId, FloorTileSizeId,
            status: "ACTIVE"
        }
        if (exclude_ids) where.id = {
            [Sequelize.Op.notIn]: exclude_ids
        }
        let cart_floor_item;
        if (cart || UserId){
            console.log("HERERERR")
            if (!cart && UserId){
                cart = await getUserActiveCart({ UserId })
            }
            cart_floor_item = await findOneCartFloorItem({
                CartId: cart.id, mil_type, FloorId, FloorTileSizeId, UserId
            })
        }
        if (cart_floor_item && limit) limit += cart_floor_item.boxes_amount 
        let floor_boxes_amount = await FloorBox.count({ where, limit })
        let floor_boxes2 = await FloorBox.findAll({ where, limit: 1 })
        console.log({cart,UserId, floor_boxes_amount})
        
        if (cart_floor_item){
            console.log("cart_floor_item FOUND")
            console.log({floor_boxes_amount,cart_floor_item_boxes_amount: cart_floor_item.boxes_amount})
            floor_boxes_amount -= cart_floor_item.boxes_amount 
        }
        let square_feet_available = floor_boxes_amount * 23.4
        let data = {
            pallets: Math.floor(floor_boxes_amount / 50),
            boxes: floor_boxes_amount,
            square_feet_available,
            price: floor_boxes2.length ? floor_boxes2[0].price : 0
        } 
        // if (limit) data.floor_boxes = floor_boxes;
        return data
    }
}