if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, 
    passUserFromJWT, adminRequired, query_param_string_to_integer,
    body_param_string_to_integer, passUserFromJWT_optional, jwtNotRequired,
    multipleAuthOrNone, multipleAuth,
    passUserOrCreateGuestFromJWT, passBusinessFromJWT
} = require("../../middlewares");

const { findAll, createFloor, updateFloor, deleteFloor, findOne, findReviewsForFloor } = require("./floors-dal");
const { ErrorHandler } = require("../../utils/error");

const multer = require('multer');
const upload = multer();
const uploadFile = require("../aws/uploadFile");
const uploadMiddleware = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
])

const yup = require("yup");
const { param_id, positive_integer_as_string } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/floors/total_pages", [

], async (req,res) => {
    const floors = await findAll(req.query);
    const divided = floors.length / 10
    let total_pages = divided < 0 ? 1: Math.floor(divided + 1)
    return res.json({
        code: 200,
        message: "success",
        data: { value: total_pages }
    })
})

app.get("/floors/:floor_id",[
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_id: param_id.required()
        }),
        query: yup.object().shape({
            mil_type: param_id, 
            boxes_amount: param_id
        })
    })),
    jwtNotRequired, multipleAuth([ passBusinessFromJWT, passUserOrCreateGuestFromJWT ])
], async (req,res) => {
    let floor = await findOne({ 
        UserId: req.business ? req.business.UserId : req.user.id,
        floor_id: req.params.floor_id,
        ...req.query 
    })
    return res.json({
        code: 200,
        message: "success",
        data: { floor }
    })
})

app.get("/floors/:floor_id/reviews", [
    validateRequest(
        yup.object().shape({
            params: yup.object().shape({
                floor_id: param_id.required()
            })
        })
    )
], async (req,res) => {
    let { floor_id } = req.params;
    let reviews = await findReviewsForFloor(floor_id)
    return res.json({
        code: 200,
        message: "success",
        data: { reviews }
    })
})

app.get("/floors", [
    query_param_string_to_integer("min_price"),
    query_param_string_to_integer("max_price"),
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            FloorCategoryId: param_id,
            ColorId: param_id,
            FloorTypeSlug: yup.string(),
            Color: yup.string(),
            query: yup.string(),
            min_price: yup.number(),
            max_price: yup.number().when('min_price', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            }),
            page: param_id
        })
    }))
], async (req,res) => {
    let floors = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { floors }
    })
})

app.patch("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    body_param_string_to_integer("plank_dimension_width"),
    body_param_string_to_integer("plank_dimension_height"), 
    uploadMiddleware, validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string(),
            description: yup.string(),
            FloorCategoryId: positive_integer_as_string,
            FloorTypeSlug: positive_integer_as_string,
            ColorId: positive_integer_as_string,
            plank_dimension_width: param_id.required(),
            plank_dimension_height: param_id.required(),
        }),
        params: yup.object().shape({
            floor_id: param_id.required()
        })
    }))
], async (req,res) => {
    if (req.files) {
        if (
            req.files["thumbnail"] &&
            req.files["thumbnail"].length
        ) req.files["thumbnail"] = req.body["thumbnail_url"] = await uploadFile(req.files["thumbnail"][0]);
    }
    let floor = await updateFloor({ 
        pk: req.params.floor_id,
        data: req.body
    })
    return res.json({
        code: 204,
        message: "success",
        data: { floor }
    })
})

app.delete("/floors/:floor_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteFloor(req.params.floor_id);
    return res.json({
        code: 204,
        message: "success"
    })
})

app.post("/floors", [
    jwtRequired, passUserFromJWT, adminRequired,
    uploadMiddleware, body_param_string_to_integer("price"),
    body_param_string_to_integer("plank_dimension_width"),
    body_param_string_to_integer("plank_dimension_height"), 
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            description: yup.string().required(),
            FloorCategoryId: positive_integer_as_string.required(),
            FloorTypeSlug: positive_integer_as_string.required(),
            ColorId: positive_integer_as_string.required(),
            plank_dimension_width: yup.number().positive().required(),
            plank_dimension_height: yup.number().positive().required(),
        })
    }))
], async (req,res) => {
    if (req.files) {
        if (
            req.files["thumbnail"] &&
            req.files["thumbnail"].length
        ) req.files["thumbnail"] = req.body["thumbnail_url"] = await uploadFile(req.files["thumbnail"][0]);
    }
    let floor = await createFloor({
        ...req.body,
        UserId: req.user.id
    })
    return res.json({
        code: 201,
        message: "success",
        data: { floor }
    })
})
