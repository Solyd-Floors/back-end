
const yup = require("yup");
const { param_id } = require("../utils/validations");

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
    })
}