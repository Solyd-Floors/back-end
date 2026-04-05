// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createBusiness, updateBusiness, deleteBusiness } = require("./businesses-dal");
const { ErrorHandler } = require("../../utils/error");
const { param_id } = require("../utils/validations");
const yup = require("yup");

app.use(allowCrossDomain)

app.get("/businesses", async (req,res) => {
    let businesses = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { businesses }
    })
})

app.post("/businesses",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            address: yup.string().required(),
            phone_number: yup.string().required(),
            UserId: yup.number().positive().required(),
            IndustryId: yup.number().positive().required(),
        })
    }))
], async (req,res) => {
    let business = await createBusiness(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { business }
    })
})

app.patch("/businesses/:business_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            address: yup.string().required(),
            phone_number: yup.string().required(),
            UserId: yup.number().positive().required(),
            IndustryId: yup.number().positive().required(),
        }),
        params: yup.object().shape({
            business_id: param_id.required()
        })
    }))
], async (req,res) => {
    let business = await updateBusiness({
        pk: req.params.business_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { business }
    })
})

app.delete("/businesses/:business_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            business_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteBusiness(req.params.business_id)
    return res.json({
        code: 204,
        message: "success"
    })
})