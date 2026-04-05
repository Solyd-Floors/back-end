// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { getGallery, createGalleryImage, switchGalleryImages, deleteGalleryImage } = require("./general-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const multer = require('multer');
const upload = multer();
const uploadFile = require("../aws/uploadFile");
const uploadMiddleware = upload.fields([
    { name: 'image', maxCount: 1 },
])

app.post("/general/base64_to_url",[
    uploadMiddleware
], async (req,res) => {
    if (req.files) {
        if (
            req.files["image"] &&
            req.files["image"].length
        ) {
            return res.json({
                code: 200,
                message: "success",
                data: { 
                    url: await uploadFile(req.files["image"][0])
                }
            })
        }
    }
    return res.json({
        code: 400,
        message: "Bad request, reason unknown"
    })
})

app.get("/general/gallery", async (req,res) => {
    let gallery = await getGallery();
    return res.json({
        code: 200,
        message: "success",
        data: { gallery }
    })
})

app.post("/general/gallery/insert_image",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(
        yup.object().shape({
            requestBody: yup.object().shape({
                image_url: yup.string().required(),
                FloorId: id
            })
        })
    )
], async (req,res) => {
    let gallery_image = await createGalleryImage(req.body);
    return res.json({
        code: 201,
        message: "success",
        data: { gallery_image }
    })
})

app.delete("/general/gallery/images/:id",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(
        yup.object().shape({
            params: yup.object().shape({
                id: param_id.required()
            })
        })
    )
], async (req,res) => {
    let { id } = req.params;
    await deleteGalleryImage(id)
    return res.json({ code: 200, message: "success" })
})

app.post("/general/gallery/switch_images", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(
        yup.object().shape({
            requestBody: yup.object().shape({
                index_x: yup.number().integer().required(),
                index_y: yup.number().integer().required(),
            })
        })
    )
], async (req,res) => {
    await switchGalleryImages(req.body)
    return res.json({ code: 200, message: "success" })
})