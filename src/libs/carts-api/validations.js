
const yup = require("yup");
const { param_id, id } = require("../utils/validations");

let mil_type_schema = yup.number().integer().positive().required()

module.exports = {
    get_carts_id: yup.object().shape({
        params: yup.object().shape({
            carts_id: param_id.required()
        })
    }),
    get_carts: yup.object().shape({
        query: yup.object().shape({

        })
    }),
    post_carts: yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().integer().positive().required(),
        })
    }),
    delete_carts: yup.object().shape({
        params: yup.object().shape({
            carts_id: param_id.required()
        })
    }),
    patch_carts: yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().integer().positive(),
        }),
        params: yup.object().shape({
            carts_id: param_id.required()
        })
    }),
    post_carts_add_floor_boxes: yup.object().shape({
        requestBody: yup.object().shape({
            mil_type: mil_type_schema,
            FloorId: id.required(),
            floor_tile_sizes: yup.array().of(mil_type_schema),
        })
    })
}