
const yup = require("yup")
const { param_id } = require("../utils/validations")

module.exports = {
    get_employees_employee_id: yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    }),
    post_my_business_employees: yup.object().shape({
        requestBody: yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().min(8).required(),
            first_name: yup.string().required(),
            last_name: yup.string().required(),
            address: yup.string(),
            address2: yup.string(),
            city: yup.string(),
            state: yup.string(),
            country: yup.string(),
            postcode: yup.string(),
            phone_number: yup.string(),
        })
    }),
    patch_my_business_employees: yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        }),
        requestBody: yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().min(8).required(),
            first_name: yup.string().required(),
            last_name: yup.string().required(),
            address: yup.string(),
            address2: yup.string(),
            city: yup.string(),
            state: yup.string(),
            country: yup.string(),
            postcode: yup.string(),
            phone_number: yup.string(),
        })
    }),
}