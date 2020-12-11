if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_videos, patch_videos, delete_videos } = require("./validations");
const { findAll, createVideo, updateVideo, deleteVideo } = require("./videos-dal");
const { ErrorHandler } = require("../../utils/error");

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
    validateRequest(post_videos)
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
    validateRequest(patch_videos)
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
    validateRequest(delete_videos)
], async (req,res) => {
    await deleteVideo(req.params.video_id)
    return res.json({
        code: 204,
        message: "success"
    })
})