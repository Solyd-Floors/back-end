
const yup = require("yup");
const { param_id, id } = require("../utils/validations");

module.exports = {
    post_cart_floor_items: yup.object().shape({
        requestBody: yup.object().shape({
            CartId: id.required(), 
            mil_type: id.required(),
            boxes_amount: id.required(),
            FloorTileSizeId: id.required(),
            FloorId: id.required(),
        })
    }),
    patch_cart_floor_items: yup.object().shape({
        requestBody: yup.object().shape({ 
            mil_type: id.required(),
            boxes_amount: id.required(),
            FloorTileSizeId: id.required(),
            FloorId: id.required(),
        }),
        params: yup.object().shape({
            cart_floor_item_id: param_id.required()
        })
    }),
    delete_cart_floor_items: yup.object().shape({
        params: yup.object().shape({
            cart_floor_item_id: param_id.required()
        })
    })
}