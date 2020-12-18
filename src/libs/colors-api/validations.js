
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_colors: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            color: yup.string().required(),
        })
    }),
    patch_colors: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            color: yup.string().required(),
        }),
        params: yup.object().shape({
            color_id: param_id.required()
        })
    }),
    delete_colors: yup.object().shape({
        params: yup.object().shape({
            color_id: param_id.required()
        })
    })
}