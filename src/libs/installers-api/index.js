if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createInstaller, updateInstaller, deleteInstaller } = require("./installers-dal");
const { ErrorHandler } = require("../../utils/error");

const { doesUserHaveInstaller } = require("../users-dal");

const multer = require('multer');
const upload = multer();
const uploadFile = require("../aws/uploadFile");
const uploadMiddleware = upload.fields([
    { name: 'profile_picture', maxCount: 1 },
])

const yup = require("yup");
const { param_id, positive_integer_as_string } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/installers",[
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]),
            CountryId: param_id,
            min_age: yup.number(),
            max_age: yup.number().when('min_age', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            }),
            min_hourly_rate: yup.number(),
            max_hourly_rate: yup.number().when('min_hourly_rate', {
                is: val => Boolean(val), // alternatively: (val) => val == true
                then: yup.number().required(),
                otherwise: yup.number(),
            })
        })
    }))
], async (req,res) => {
    let installers = await findAll(req.query);
    return res.json({
        code: 200,
        message: "success",
        data: { installers }
    })
})

app.post("/installers", [ 
    uploadMiddleware, validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            UserId: positive_integer_as_string,
            CountryId: positive_integer_as_string.required(),
            age: positive_integer_as_string.required(),
            hourly_rate: positive_integer_as_string.required(), 
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]).required(),
            profile_picture: yup.string(),
            status: yup.string().oneOf(["PENDING","APPROVED","DENIED"]),
        })
    })),
    jwtRequired, passUserFromJWT,
], async (req,res) => {
    let UserId = req.body.UserId || req.user.id
    if (
        (req.body.status || req.body.UserId) && !req.user.isAdmin
    ) throw new ErrorHandler(401, "Unauthorized", [ "Not authorized to change status"])
    if (await doesUserHaveInstaller(UserId)) {
        throw new ErrorHandler(403, "Already exists", [ `User with id ${req.body.UserId || UserId} is already an installer`])
    }
    if (req.files) {
        if (
            req.files["profile_picture"] &&
            req.files["profile_picture"].length
        ) req.files["profile_picture"] = req.body["profile_picture_url"] = await uploadFile(req.files["profile_picture"][0]);
    }
    let installer = await createInstaller({
        ...req.body, UserId
    })
    return res.json({
        code: 201,
        message: "success",
        data: { installer }
    })
})

app.patch("/installers/:installer_id",[
    uploadMiddleware,jwtRequired, passUserFromJWT, 
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            UserId: positive_integer_as_string,
            CountryId: positive_integer_as_string,
            age: positive_integer_as_string,
            hourly_rate: positive_integer_as_string, 
            job_status: yup.string().oneOf(["EMPLOYED","UNEMPLOYED"]),
            status: yup.string().oneOf(["PENDING","APPROVED","DENIED"]),
            profile_picture: yup.string()
        }),
        params: yup.object().shape({
            installer_id: param_id.required()
        })
    }))
], async (req,res) => {
    // TODO: UserId checks
    if (
        (req.body.status || req.body.UserId) && !req.user.isAdmin
    ) throw new ErrorHandler(401, "Unauthorized", [ "Not authorized to change status"])
    if (req.files) {
        if (
            req.files["profile_picture"] &&
            req.files["profile_picture"].length
        ) req.files["profile_picture"] = req.body["profile_picture_url"] = await uploadFile(req.files["profile_picture"][0]);
    }
    let installer = await updateInstaller({
        pk: req.params.installer_id,
        data: { 
            ...req.body, UserId: req.body.UserId || req.user.id,
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            installer_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteInstaller(req.params.installer_id);
    return res.json({
        code: 200,
        message: "success"
    })
})