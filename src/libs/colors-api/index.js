if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createColor, updateColor, deleteColor } = require("./colors-dal");
const { ErrorHandler } = require("../../utils/error");
const { param_id } = require("../utils/validations");
const yup = require("yup");

app.use(allowCrossDomain)

app.get("/colors", async (req,res) => {
    let colors = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { colors }
    })
})

app.post("/colors",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            color: yup.string().required(),
        })
    }))
], async (req,res) => {
    let color = await createColor(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { color }
    })
})

app.patch("/colors/:color_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
            color: yup.string().required(),
        }),
        params: yup.object().shape({
            color_id: param_id.required()
        })
    }))
], async (req,res) => {
    let color = await updateColor({
        pk: req.params.color_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { color }
    })
})

app.delete("/colors/:color_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            color_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteColor(req.params.color_id)
    return res.json({
        code: 204,
        message: "success"
    })
})