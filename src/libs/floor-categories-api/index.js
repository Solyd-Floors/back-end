if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createFloorCategory, updateFloorCategory, deleteFloorCategory } = require("./floor-categories-dal");
const { ErrorHandler } = require("../../utils/error");
const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/floor_categories", async (req,res) => {
    let floor_categories = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { floor_categories }
    })
})

app.post("/floor_categories", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        })
    }))
], async (req,res) => {
    let floor_category = await createFloorCategory(req.body);
    return res.json({
        code: 201,
        message: "success",
        data: { floor_category }
    })
})

app.patch("/floor_categories/:floor_category_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string(),
        }),
        params: yup.object().shape({
            floor_category_id: param_id.required()
        })
    }))
], async (req,res) => {
    let floor_category = await updateFloorCategory({
        data: req.body,
        pk: req.params.floor_category_id
    });
    return res.json({
        code: 200,
        message: "success",
        data: { floor_category }
    })
})

app.delete("/floor_categories/:floor_category_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_category_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteFloorCategory(req.params.floor_category_id)
    return res.json({
        code: 204,
        message: "success"
    })
})