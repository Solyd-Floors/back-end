
const yup = require("yup");

module.exports = {
    post_contacts: yup.object().shape({
        requestBody: yup.object().shape({
            first_name: yup.string().required(),
            last_name: yup.string().required(),
            email: yup.string().required(),
            reason: yup.string().required(),
        })
    })
}