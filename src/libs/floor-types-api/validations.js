
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_floor_types: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        })
    }),
    patch_floor_types: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        }),
        params: yup.object().shape({
            floor_type_id: param_id.required()
        })
    }),
    delete_floor_types: yup.object().shape({
        params: yup.object().shape({
            floor_type_id: param_id.required()
        })
    })
}