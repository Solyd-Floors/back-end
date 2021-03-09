if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { 
    post_users, 
    post_users_unrestricted, 
    patch_users_unrestricted, 
    only_user_id_param_required,
    post_send_verification_link,
    post_reset_password
} = require("./validations");
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

app.use(allowCrossDomain)

app.post("/users/send_verification_link", validateRequest(post_send_verification_link), async (req,res) => {
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

app.post("/users/reset_password/:token", validateRequest(post_reset_password), async (req, res) => {
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
    jwtRequired, passUserFromJWT, validateRequest(only_user_id_param_required)
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
    validateRequest(only_user_id_param_required)
], async (req,res) => {
    await deleteUser(req.params.user_id)
    return res.json({
        message: "success",
        code: 204
    })
})

app.patch("/users/:user_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(only_user_id_param_required),
    validateRequest(patch_users_unrestricted)
], async (req,res) => {
    let user = await updateUser({
        pk: req.params.user_id,
        data: req.body
    })
    user = JSON.parse(JSON.stringify(user))
    user.password = null;
    return res.json({
        message: "success",
        code: 200,
        data: { user }
    })
})

app.post("/users", validateRequest(post_users), async (req, res) => {
    let user = await createUser(req.body);
    return res.json({
        message: "success",
        code: 201,
        data: { user, token: createToken("userId",user.id) }
    })
})

app.post("/users/unrestricted", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(post_users_unrestricted)
], async (req, res) => {
    let user = await createUserUnrestricted(req.body);
    return res.json({
        message: "success",
        code: 201,
        data: { user }
    })
})