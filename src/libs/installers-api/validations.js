
const yup = require("yup");

module.exports = {
    post_installers: yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().positive().required(),
            CountryId: yup.number().positive().required(),
            age: yup.number().positive().required(),
            hourly_rate: yup.number().positive().required(),
            status: yup.string().oneOf(["PENDING","APPROVED","DENIED"])
        })
    })
}