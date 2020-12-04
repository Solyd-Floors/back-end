
const yup = require("yup");

module.exports = {
    post_floor_types: yup.object().shape({
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
    })
}