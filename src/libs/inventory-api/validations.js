
const yup = require("yup");
const { param_id, id, positive_integer_as_string } = require("../utils/validations");

let mil_type_schema = yup.number().integer().positive()

let post_inventory_shape = yup.object().shape({
    mil_type: mil_type_schema.required(),
    price: yup.number().positive().required(),
    FloorId: id.required(),
    FloorTileSizeId: id.required(),
    amount: yup.number().positive().required(),
})

module.exports = {
    post_inventory: yup.object().shape({
        requestBody: post_inventory_shape
    }),
    patch_inventory: yup.object().shape({
        requestBody: yup.object().shape({
            before: post_inventory_shape,
            after: post_inventory_shape
        })
    })

}