
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_industries: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        })
    }),
    patch_industries: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        }),
        params: yup.object().shape({
            industry_id: param_id.required()
        })
    }),
    delete_industries: yup.object().shape({
        params: yup.object().shape({
            industry_id: param_id.required()
        })
    })
}