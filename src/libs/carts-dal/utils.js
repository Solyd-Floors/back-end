
const { FloorBox } = require("../../models")

module.exports = {
    getCartFloorItemWithMoreInfo: async cart_floor_item_instance => {
        let mil_type = cart_floor_item_instance.mil_type
        let FloorId = cart_floor_item_instance.FloorId
        let boxes_amount = cart_floor_item_instance.boxes_amount
        console.log({mil_type, FloorId, boxes_amount})
        let floor_boxes = await FloorBox.findAll({ where: { mil_type, FloorId }, limit: boxes_amount})
        console.log({floor_boxes})
        let prices = floor_boxes.map(x => x.price_per_square_foot);
        let total_price = (prices[0] * 23.4) * boxes_amount
        if (floor_boxes.length < boxes_amount) cart_floor_item_instance.not_available = true;
        cart_floor_item_instance.price_per_square_foot = prices[0]
        return { ...cart_floor_item_instance, total_price};
    }
}