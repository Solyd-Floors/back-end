if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_installers, delete_installers, patch_installers } = require("./validations");
const { findAll, createInstaller, updateInstaller, deleteInstaller } = require("./installers-dal");
const { ErrorHandler } = require("../../utils/error");

const { doesUserHaveInstaller } = require("../users-dal");

app.use(allowCrossDomain)

app.get("/installers", async (req,res) => {
    let installers = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { installers }
    })
})

app.post("/installers", [ 
    validateRequest(post_installers),
    jwtRequired, passUserFromJWT,
], async (req,res) => {
    let UserId = req.body.UserId || req.user.id
    if (
        (req.body.status || req.body.UserId) && !req.user.isAdmin
    ) throw new ErrorHandler(401, "Unauthorized", [ "Not authorized to change status"])
    if (await doesUserHaveInstaller(UserId)) {
        throw new ErrorHandler(403, "Already exists", [ `User with id ${req.body.UserId || UserId} is already an installer`])
    }
    let installer = await createInstaller({
        ...req.body, profile_picture_url: req.body.profile_picture, // TODO: convert src to file
        UserId
    })
    return res.json({
        code: 201,
        message: "success",
        data: { installer }
    })
})

app.patch("/installers/:installer_id",[
    jwtRequired, passUserFromJWT,
    validateRequest(patch_installers)
], async (req,res) => {
    // TODO: UserId checks
    if (
        (req.body.status || req.body.UserId) && !req.user.isAdmin
    ) throw new ErrorHandler(401, "Unauthorized", [ "Not authorized to change status"])
    let installer = await updateInstaller({
        pk: req.params.installer_id,
        data: { 
            ...req.body, UserId: req.body.UserId || req.user.id,
            profile_picture_url: req.body.profile_picture 
        }
    })
    return res.json({
        code: 200,
        message: "success",
        data: { installer }
    })
})

app.delete("/installers/:installer_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(delete_installers)
], async (req,res) => {
    await deleteInstaller(req.params.installer_id);
    return res.json({
        code: 200,
        message: "success"
    })
})