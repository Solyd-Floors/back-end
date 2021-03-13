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

const { findAll, createFloor, updateFloor, deleteFloor, findOne } = require("./floors-dal");
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

app.get("/floors/:floor_id",[
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_id: param_id.required()
        }),
        query: yup.object().shape({
            mil_type: param_id, 
            FloorTileSizeId: param_id, 
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

app.get("/floors", [
    query_param_string_to_integer("min_price"),
    query_param_string_to_integer("max_price"),
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            FloorCategoryId: param_id,
            ColorId: param_id,
            FloorTypeId: param_id,
            query: yup.string(),
            min_price: yup.number(),
            max_price: yup.number().when('min_price', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            })
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
    uploadMiddleware, validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string(),
            description: yup.string(),
            FloorCategoryId: positive_integer_as_string,
            FloorTypeId: positive_integer_as_string,
            ColorId: positive_integer_as_string,
            floor_tile_sizes: yup.array().of(positive_integer_as_string.required()),
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
    if (req.body.floor_tile_sizes){
        req.body.floor_tile_sizes = req.body.floor_tile_sizes.map(x => Number(x))
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
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            description: yup.string().required(),
            FloorCategoryId: positive_integer_as_string.required(),
            FloorTypeId: positive_integer_as_string.required(),
            ColorId: positive_integer_as_string.required(),
            floor_tile_sizes: yup.array().of(positive_integer_as_string.required()).required(),
        })
    }))
], async (req,res) => {
    if (req.files) {
        if (
            req.files["thumbnail"] &&
            req.files["thumbnail"].length
        ) req.files["thumbnail"] = req.body["thumbnail_url"] = await uploadFile(req.files["thumbnail"][0]);
    }
    req.body.floor_tile_sizes = req.body.floor_tile_sizes.map(x => Number(x))
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