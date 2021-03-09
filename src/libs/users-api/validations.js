
const yup = require("yup");
const { email, password } = require("../utils/validations");

module.exports = {
    only_user_id_param_required: yup.object().shape({
        params: yup.object().shape({
            user_id: yup.string().test("is-number", val => !isNaN(Number(val)))
        })
    }),
    post_reset_password: yup.object().shape({
        requestBody: yup.object().shape({
            new_password: password.required(),
            confirm_new_password: password.required().oneOf([yup.ref("new_password")]),
        })
    }),
    post_send_verification_link: yup.object().shape({
        requestBody: yup.object().shape({
            email: yup.string().email().required()
        })
    }),
    post_users: yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
            first_name: yup.string().required().min(5),
            last_name: yup.string().required().min(5),
            phone: yup.string(),
            address: yup.string(),
        })
    }),
    post_users_unrestricted: yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
            first_name: yup.string().required().min(5),
            last_name: yup.string().required().min(5),
            phone: yup.string(),
            address: yup.string(),
        })
    }),
    patch_users_unrestricted: yup.object().shape({
        requestBody: yup.object().shape({
            email: email,
            password: password,
            first_name: yup.string().min(5),
            last_name: yup.string().min(5),
            phone: yup.string(),
            address: yup.string(),
        })
    })
}