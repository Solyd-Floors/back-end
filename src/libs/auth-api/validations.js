const yup = require("yup");

const { email, password, id } = require("../utils/validations");

module.exports = {
    post_auth: yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
        }).required()
    }),
    post_employee_auth: yup.object().shape({
        requestBody: yup.object().shape({
            BusinessId: id.required(),
            email: email.required(),
            password: password.required(),
        }).required()
    }),
}
