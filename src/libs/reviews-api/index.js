// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createReview, updateReview, deleteReview } = require("./reviews-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/reviews", async (req,res) => {
    let reviews = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { reviews }
    })
})

app.post("/reviews",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            description: yup.string().required(),
            value: yup.number().integer().positive().min(0).max(10).required(),
            FloorId: yup.number().integer().positive().required()
        })
    }))
], async (req,res) => {
    let review = await createReview(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { review }
    })
})

app.patch("/reviews/:review_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            description: yup.string(),
            value: yup.number().integer().positive().min(0).max(10),
            FloorId: yup.number().integer().positive()
        }),
        params: yup.object().shape({
            review_id: param_id.required()
        })
    }))
], async (req,res) => {
    let review = await updateReview({
        pk: req.params.review_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { review }
    })
})

app.delete("/reviews/:review_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            review_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteReview(req.params.review_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
