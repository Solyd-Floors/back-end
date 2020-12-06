
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_floor_categories: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        })
    }),
    delete_floor_categories: yup.object().shape({
        params: yup.object().shape({
            floor_category_id: param_id.required()
        })
    }),
    patch_floor_categories: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string(),
        }),
        params: yup.object().shape({
            floor_category_id: param_id.required()
        })
    })
}