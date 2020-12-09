
const yup = require("yup");
const { param_id } = require("../utils/validations");

module.exports = {
    post_team_members: yup.object().shape({
        requestBody: yup.object().shape({
            full_name: yup.string().required(),
            position: yup.string().required(),
            description: yup.string().required(),
        })
    }),
    patch_team_members: yup.object().shape({
        requestBody: yup.object().shape({
            full_name: yup.string().required(),
            position: yup.string().required(),
            description: yup.string().required(),
        }),
        params: yup.object().shape({
            team_member_id: param_id.required()
        })
    }),
    delete_team_members: yup.object().shape({
        params: yup.object().shape({
            team_member_id: param_id.required()
        })
    })
}