
const yup = require("yup");

module.exports = {
    post_installers: yup.object().shape({
        requestBody: yup.object().shape({
            CountryId: yup.number().positive().required(),
            age: yup.number().positive().required(),
            hourly_rate: yup.number().positive().required(), 
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]),
            profile_picture: yup.string()
        })
    })
}