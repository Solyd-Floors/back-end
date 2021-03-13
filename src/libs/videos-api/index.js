if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createVideo, updateVideo, deleteVideo } = require("./videos-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/videos", async (req,res) => {
    let videos = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { videos }
    })
})

app.post("/videos",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            youtube_url: yup.string().required(),
            title: yup.string().required(),
            description: yup.string().required(),
        })
    }))
], async (req,res) => {
    let video = await createVideo(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { video }
    })
})

app.patch("/videos/:video_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            youtube_url: yup.string().required(),
            title: yup.string().required(),
            description: yup.string().required(),
        }),
        params: yup.object().shape({
            video_id: param_id.required()
        })
    }))
], async (req,res) => {
    let video = await updateVideo({
        pk: req.params.video_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { video }
    })
})

app.delete("/videos/:video_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            video_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteVideo(req.params.video_id)
    return res.json({
        code: 204,
        message: "success"
    })
})