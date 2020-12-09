
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    get_floors: yup.object().shape({
        query: yup.object().shape({
            FloorCategoryId: param_id,
            BrandId: param_id,
            FloorTypeId: param_id,
            query: yup.string(),
            min_price: yup.number(),
            max_price: yup.number().when('minPrice', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            })
        })
    }),
    post_floors: yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            thumbnail_url: yup.string().required(),
            price: yup.number().positive().required(),
            quantity: yup.number().positive().required(),
            FloorCategoryId: yup.number().positive().required(),
            FloorTypeId: yup.number().positive().required(),
            BrandId: yup.number().positive().required(),
            UserId: yup.number().positive().required(),
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
            thumbnail_url: yup.string(),
            price: yup.number().positive(),
            quantity: yup.number().positive(),
            FloorCategoryId: yup.number().positive(),
            FloorTypeId: yup.number().positive(),
            BrandId: yup.number().positive(),
            UserId: yup.number().positive(),
        }),
        params: yup.object().shape({
            floor_id: param_id.required()
        })
    })
}