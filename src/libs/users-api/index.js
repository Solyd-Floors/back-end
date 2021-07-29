if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const createToken = require("../utils/createToken");
const {
    updateUser,
    deleteUser, 
    createUser, 
    createUserUnrestricted, 
    findAll, 
    findByPk,
    findUserByEmail
} = require("./users-dal");
const { ErrorHandler } = require("../../utils/error");
const jwt = require("jsonwebtoken");
const email_manager = require("../email-manager");

const yup = require("yup");
const { email, password } = require("../utils/validations");
const { sendEmail } = require("../email-manager");

app.use(allowCrossDomain)

const multer = require("multer")
const upload = multer();
const uploadMiddleware = upload.fields([
    { name: 'picture_image', maxCount: 1 },
])


app.post("/users/send_verification_link", validateRequest(yup.object().shape({
    requestBody: yup.object().shape({
        email: yup.string().email().required()
    })
})), async (req,res) => {
    let { email } = req.body;
    let code = Math.floor(100000 + Math.random() * 900000);
    let forget_password_token = jwt.sign({
        code, email
    }, process.env.FORGET_PASSWORD_JWT_SECRET, { expiresIn: "5h" })
    try {
        let user = await findUserByEmail(email)
        let { id: pk } = user;
        await updateUser({ pk, data: { forget_password_token } })
    } catch (err) {
        if (err.message === "The resource you tried to update does not exist") {
            console.log("PASSING: The resource you tried to update does not exist")
        }
        else throw err
    }
    let emailData = email_manager.createForgetPasswordEmail({ to: email, code })
    email_manager.sendEmail(emailData);
    console.log("Valid for 5 hours, Your code is: ", code)
    console.log("DEV: token is: ", forget_password_token)
    return res.json({
        message: "success",
        code: 201
    })
})

app.get("/users/reset_password/:token", async (req, res) => {
    let { token } = req.params;
    try {
        decoded = jwt.verify(token, process.env.FORGET_PASSWORD_JWT_SECRET)
    } catch (err) {
        return res.json({
            code: 200,
            message: "success",
            data: { valid: false }
        })
    }
    return res.json({
        code: 200,
        message: "success",
        data: { valid: true }
    })
});

app.post("/users/reset_password/:token", validateRequest(yup.object().shape({
    requestBody: yup.object().shape({
        new_password: password.required(),
        confirm_new_password: password.required().oneOf([yup.ref("new_password")]),
    })
})), async (req, res) => {
    let { new_password } = req.body;
    let { token } = req.params;
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.FORGET_PASSWORD_JWT_SECRET)
    } catch (err) {
        if (err.name === "TokenExpiredError")
        throw new ErrorHandler(401, "Link has expired", ["Link has expired."])
    }
    // if (decoded.code !== code) throw new ErrorHandler(401, "Code is invalid");
    let user = await findUserByEmail(decoded.email)
    await updateUser({ pk: user.id, data: { password: new_password } })
    return res.json({
        message: "success",
        code: 201
    })
})

app.get("/users", [
    jwtRequired, passUserFromJWT
], async (req,res) => {
    let users = await findAll(); 
    return res.json({
        message: "success",
        code: 200,
        data: { users }
    })
})

app.get("/users/:user_id", [
    jwtRequired, passUserFromJWT, validateRequest(yup.object().shape({
        params: yup.object().shape({
            user_id: yup.string().test("is-number", val => !isNaN(Number(val)))
        })
    }))
], async (req,res) => {
    let user = await findByPk(req.params.user_id);
    if (!user) throw ErrorHandler.get404("User")
    return res.json({
        message: "success",
        code: 200,
        data: { user }
    })
})

app.delete("/users/:user_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            user_id: yup.string().test("is-number", val => !isNaN(Number(val)))
        })
    }))
], async (req,res) => {
    await deleteUser(req.params.user_id)
    return res.json({
        message: "success",
        code: 204
    })
})

app.patch("/users/:user_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    uploadMiddleware,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            user_id: yup.string().test("is-number", val => !isNaN(Number(val)))
        }),
        requestBody: yup.object().shape({
            email: email,
            password: password,
            first_name: yup.string().min(2),
            last_name: yup.string().min(2),
            phone: yup.string(),
            address: yup.string(),
        })
    })),
], async (req,res) => {
    let args = {
        pk: req.params.user_id,
        data: req.body
    }
    let files = {}
    if (req.files) {
        if (
            req.files["picture_image"] &&
            req.files["picture_image"].length
        ) files["picture_image"] = args.data["picture_image"] = req.files["picture_image"][0];
    }
    let user = await updateUser(args)
    user = JSON.parse(JSON.stringify(user))
    user.password = null;
    return res.json({
        message: "success",
        code: 200,
        data: { user }
    })
})

app.post("/users", validateRequest(yup.object().shape({
    requestBody: yup.object().shape({
        email: email.required(),
        password: password.required(),
        first_name: yup.string().required().min(2),
        last_name: yup.string().required().min(2),
        phone: yup.string(),
        address: yup.string(),
    })
})), async (req, res) => {
    let args = { ...req.body }
    let files = {}
    if (req.files) {
        if (
            req.files["picture_image"] &&
            req.files["picture_image"].length
        ) files["picture_image"] = args["picture_image"] = req.files["picture_image"][0];
    }
    let user = await createUser(args);
    sendEmail({
        to: user.email,
        subject: `Welcome ${user.first_name} ${user.last_name}! You have signed up successfully on Solyd Floors.`,
        text: `Welcome ${user.first_name} ${user.last_name}! You have signed up successfully on Solyd Floors.`,
        html: `Welcome ${user.first_name} ${user.last_name}! You have signed up successfully on Solyd Floors.`,
    })
    return res.json({
        message: "success",
        code: 201,
        data: { user, token: createToken("userId",user.id) }
    })
})

app.post("/users/unrestricted", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
            first_name: yup.string().required().min(2),
            last_name: yup.string().required().min(2),
            phone: yup.string(),
            address: yup.string(),
        })
    }))
], async (req, res) => {
    let user = await createUserUnrestricted(req.body);
    return res.json({
        message: "success",
        code: 201,
        data: { user }
    })
})