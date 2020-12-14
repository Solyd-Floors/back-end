
const yup = require("yup");
const { param_id, positive_integer_as_string } = require("../utils/validations");

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
            UserId: positive_integer_as_string,
            CountryId: positive_integer_as_string.required(),
            age: positive_integer_as_string.required(),
            hourly_rate: positive_integer_as_string.required(), 
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
            UserId: positive_integer_as_string,
            CountryId: positive_integer_as_string,
            age: positive_integer_as_string,
            hourly_rate: positive_integer_as_string, 
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]),
            status: yup.string().oneOf(["PENDING","APPROVED","DENIED"]),
            profile_picture: yup.string()
        }),
        params: yup.object().shape({
            installer_id: param_id.required()
        })
    })
}