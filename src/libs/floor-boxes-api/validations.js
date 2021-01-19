
const yup = require("yup");
const { param_id, id, positive_integer_as_string } = require("../utils/validations");

let mil_type_schema = yup.number().integer().positive()

module.exports = {
    get_floor_boxes_info: yup.object().shape({
        query: yup.object().shape({
            mil_type: positive_integer_as_string.required(),
            FloorId: positive_integer_as_string.required(),
            FloorTileSizeId: positive_integer_as_string.required() 
        })
    }),
    get_floor_boxes_floor_box_id: yup.object().shape({
        params: yup.object().shape({
            floor_box_id: param_id.required()
        })
    }),
    get_floor_boxes: yup.object().shape({
        query: yup.object().shape({

        })
    }),
    post_floor_boxes: yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema.required(),
            price: yup.number().positive().required(),
            FloorId: id.required(),
            FloorTileSizeId: id.required(),
        })
    }),
    delete_floor_boxes: yup.object().shape({
        params: yup.object().shape({
            floor_box_id: param_id.required()
        })
    }),
    patch_floor_boxes: yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema,
            price: yup.number().positive(),
            FloorId: id,
            FloorTileSizeId: id,
        }),
        params: yup.object().shape({
            floor_box_id: param_id.required()
        })
    })
}