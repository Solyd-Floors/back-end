
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_businesses: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            address: yup.string().required(),
            phone_number: yup.string().required(),
            UserId: yup.number().positive().required(),
            IndustryId: yup.number().positive().required(),
        })
    }),
    patch_businesses: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            address: yup.string().required(),
            phone_number: yup.string().required(),
            UserId: yup.number().positive().required(),
            IndustryId: yup.number().positive().required(),
        }),
        params: yup.object().shape({
            business_id: param_id.required()
        })
    }),
    delete_businesses: yup.object().shape({
        params: yup.object().shape({
            business_id: param_id.required()
        })
    })
}