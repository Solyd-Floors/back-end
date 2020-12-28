
const yup = require("yup");
const { param_id, positive_integer_as_string } = require("../utils/validations");

module.exports = {
    get_floor_tile_sizes_floor_tile_size_id: yup.object().shape({
        params: yup.object().shape({
            floor_tile_size_id: param_id.required()
        })
    }),
    get_floor_tile_sizes: yup.object().shape({
        query: yup.object().shape({

        })
    }),
    post_floor_tile_sizes: yup.object().shape({
        requestBody: yup.object().shape({
            width: yup.number().integer().positive().required(),
            height: yup.number().integer().positive().required(),
        })
    }),
    delete_floor_tile_sizes: yup.object().shape({
        params: yup.object().shape({
            floor_tile_size_id: param_id.required()
        })
    }),
    patch_floor_tile_sizes: yup.object().shape({
        requestBody: yup.object().shape({
            width: yup.number().integer().positive(),
            height: yup.number().integer().positive(),
        }),
        params: yup.object().shape({
            floor_tile_size_id: param_id.required()
        })
    })
}