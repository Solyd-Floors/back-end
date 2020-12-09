
const yup = require("yup");

module.exports = {
    post_contacts: yup.object().shape({
        requestBody: yup.object().shape({
            full_name: yup.string().required(),
            email: yup.string().required(),
            reason: yup.string().required(),
        })
    })
}