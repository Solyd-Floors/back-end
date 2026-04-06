
const { FloorBox } = require("../../models")
const { BOX_COVERAGE_SQFT, toNumber } = require("../frontend-compat");

module.exports = {
    getCartFloorItemWithMoreInfo: async cart_floor_item_instance => {
        let mil_type = cart_floor_item_instance.mil_type
        let FloorId = cart_floor_item_instance.FloorId
        let boxes_amount = cart_floor_item_instance.boxes_amount
        console.log({mil_type, FloorId, boxes_amount})
        let floor_boxes = await FloorBox.findAll({ where: { mil_type, FloorId }, limit: boxes_amount})
        let fallback_floor_box = floor_boxes[0] || await FloorBox.unscoped().findOne({
            where: { mil_type, FloorId },
            order: [
                [ "id", "ASC" ]
            ]
        })
        console.log({floor_boxes})
        let base_price_per_square_foot = floor_boxes.length
            ? toNumber(floor_boxes[0].price_per_square_foot)
            : toNumber(fallback_floor_box && fallback_floor_box.price_per_square_foot);
        let total_price = base_price_per_square_foot * BOX_COVERAGE_SQFT * boxes_amount
        if (floor_boxes.length < boxes_amount) cart_floor_item_instance.not_available = true;
        cart_floor_item_instance.price_per_square_foot = base_price_per_square_foot
        return { ...cart_floor_item_instance, total_price};
    }
}
