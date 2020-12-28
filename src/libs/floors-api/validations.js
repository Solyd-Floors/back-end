
const yup = require("yup");
const { param_id, positive_integer_as_string } = require("../utils/validations");

module.exports = {
    get_floors_floor_id: yup.object().shape({
        params: yup.object().shape({
            floor_id: param_id.required()
        })
    }),
    get_floors: yup.object().shape({
        query: yup.object().shape({
            FloorCategoryId: param_id,
            ColorId: param_id,
            BrandId: param_id,
            FloorTypeId: param_id,
            query: yup.string(),
            min_price: yup.number(),
            max_price: yup.number().when('min_price', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            })
        })
    }),
    post_floors: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            description: yup.string().required(),
            price: yup.number().positive().required(),
            FloorCategoryId: positive_integer_as_string.required(),
            FloorTypeId: positive_integer_as_string.required(),
            BrandId: positive_integer_as_string.required(),
            UserId: positive_integer_as_string.required(),
            ColorId: positive_integer_as_string.required(),
        })
    }),
    delete_floors: yup.object().shape({
        params: yup.object().shape({
            floor_id: param_id.required()
        })
    }),
    patch_floors: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string(),
            description: yup.string(),
            price: yup.number().positive(),
            FloorCategoryId: positive_integer_as_string,
            FloorTypeId: positive_integer_as_string,
            BrandId: positive_integer_as_string,
            UserId: positive_integer_as_string,
            ColorId: positive_integer_as_string,
        }),
        params: yup.object().shape({
            floor_id: param_id.required()
        })
    })
}