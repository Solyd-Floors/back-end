// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createIndustry, updateIndustry, deleteIndustry } = require("./industries-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/industries", async (req,res) => {
    let industries = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { industries }
    })
})

app.post("/industries",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        })
    }))
], async (req,res) => {
    let industry = await createIndustry(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { industry }
    })
})

app.patch("/industries/:industry_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        }),
        params: yup.object().shape({
            industry_id: param_id.required()
        })
    }))
], async (req,res) => {
    let industry = await updateIndustry({
        pk: req.params.industry_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { industry }
    })
})

app.delete("/industries/:industry_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            industry_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteIndustry(req.params.industry_id)
    return res.json({
        code: 204,
        message: "success"
    })
})