if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_installers } = require("./validations");
const { findAll, createInstaller } = require("./installers-dal");
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
    if (await doesUserHaveInstaller(req.user.id)) {
        throw new ErrorHandler(403, "Already exists", [ "Logged in user is already a installer"])
    }
    let installer = await createInstaller({
        ...req.body, profile_picture_url: req.body.profile_picture, // TODO: convert src to file
        UserId: req.user.id
    })
    return res.json({
        code: 201,
        message: "success",
        data: { installer }
    })
})