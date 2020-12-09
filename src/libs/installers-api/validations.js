
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    get_installers: yup.object().shape({
        query: yup.object().shape({
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]),
            CountryId: param_id.required(),
            min_hourly_rate: yup.number(),
            max_hourly_rate: yup.number().when('minPrice', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            })
        })
    }),
    post_installers: yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().positive(),
            CountryId: yup.number().positive().required(),
            age: yup.number().positive().required(),
            hourly_rate: yup.number().positive().required(), 
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]).required(),
            profile_picture: yup.string(),
            status: yup.string().oneOf(["PENDING","APPROVED","DENIED"]),
        })
    }),
    delete_installers: yup.object().shape({
        params: yup.object().shape({
            installer_id: param_id.required()
        })
    }),
    patch_installers: yup.object().shape({
        requestBody: yup.object().shape({
            UserId: yup.number().positive(),
            CountryId: yup.number().positive(),
            age: yup.number().positive(),
            hourly_rate: yup.number().positive(), 
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]),
            status: yup.string().oneOf(["PENDING","APPROVED","DENIED"]),
            profile_picture: yup.string()
        }),
        params: yup.object().shape({
            installer_id: param_id.required()
        })
    })
}