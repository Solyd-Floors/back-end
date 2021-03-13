if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createFloorType, updateFloorType, deleteFloorType } = require("./floor-types-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/floor_types", async (req,res) => {
    let floor_types = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { floor_types }
    })
})

app.post("/floor_types",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        })
    }))
], async (req,res) => {
    let floor_type = await createFloorType(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { floor_type }
    })
})

app.patch("/floor_types/:floor_type_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            name: yup.string().required(),
        }),
        params: yup.object().shape({
            floor_type_id: param_id.required()
        })
    }))
], async (req,res) => {
    let floor_type = await updateFloorType({
        pk: req.params.floor_type_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { floor_type }
    })
})

app.delete("/floor_types/:floor_type_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            floor_type_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteFloorType(req.params.floor_type_id)
    return res.json({
        code: 204,
        message: "success"
    })
})