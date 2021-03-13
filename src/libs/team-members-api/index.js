if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createTeamMember, updateTeamMember, deleteTeamMember } = require("./team-members-dal");
const { ErrorHandler } = require("../../utils/error");


const multer = require('multer');
const upload = multer();
const uploadFile = require("../aws/uploadFile");
const uploadMiddleware = upload.fields([
    { name: 'profile_picture', maxCount: 1 },
])

const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/team_members", async (req,res) => {
    let team_members = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { team_members }
    })
})
app.post("/team_members",[
    jwtRequired, passUserFromJWT, adminRequired,
    uploadMiddleware, validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            full_name: yup.string().required(),
            position: yup.string().required(),
            description: yup.string().required(),
        })
    }))
], async (req,res) => {
    if (req.files) {
        if (
            req.files["profile_picture"] &&
            req.files["profile_picture"].length
        ) req.files["profile_picture"] = req.body["profile_picture_url"] = await uploadFile(req.files["profile_picture"][0]);
    }
    console.log(req.body)
    let team_member = await createTeamMember(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { team_member }
    })
})

app.patch("/team_members/:team_member_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    uploadMiddleware, validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            full_name: yup.string().required(),
            position: yup.string().required(),
            description: yup.string().required(),
        }),
        params: yup.object().shape({
            team_member_id: param_id.required()
        })
    }))
], async (req,res) => {
    if (req.files) {
        if (
            req.files["profile_picture"] &&
            req.files["profile_picture"].length
        ) req.files["profile_picture"] = req.body["profile_picture_url"] = await uploadFile(req.files["profile_picture"][0]);
    }
    console.log(req.body)
    let team_member = await updateTeamMember({
        pk: req.params.team_member_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { team_member }
    })
})

app.delete("/team_members/:team_member_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            team_member_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteTeamMember(req.params.team_member_id)
    return res.json({
        code: 204,
        message: "success"
    })
})