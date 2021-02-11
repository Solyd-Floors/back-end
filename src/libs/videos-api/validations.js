
const yup = require("yup");
const { param_id } = require("../utils/validations");
const fs = require("fs");

const validations = {
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

let validation = validations[Object.keys(validations)[0]]

let files = fs.readdirSync(__dirname).filter(fn => fn.endsWith('validations.js'));
console.log(validation.fields,__dirname)
console.log(files)

module.exports = validations