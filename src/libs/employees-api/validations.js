
const yup = require("yup");
const { param_id, id } = require("../utils/validations");

module.exports = {
    post_employees: yup.object().shape({
        requestBody: yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().required(),
            full_name: yup.string().required(),
            BusinessId: id.required()
        })
    }),
    patch_employees: yup.object().shape({
        requestBody: yup.object().shape({
            email: yup.string().email(),
            password: yup.string(),
            full_name: yup.string(),
            BusinessId: id.required()
        }),
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    }),
    delete_employees: yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    })
}