
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_videos: yup.object().shape({
        requestBody: yup.object().shape({
            youtube_url: yup.string().required(),
            title: yup.string().required(),
            description: yup.string().required(),
        })
    }),
    patch_videos: yup.object().shape({
        requestBody: yup.object().shape({
            youtube_url: yup.string().required(),
            title: yup.string().required(),
            description: yup.string().required(),
        }),
        params: yup.object().shape({
            video_id: param_id.required()
        })
    }),
    delete_videos: yup.object().shape({
        params: yup.object().shape({
            video_id: param_id.required()
        })
    })
}