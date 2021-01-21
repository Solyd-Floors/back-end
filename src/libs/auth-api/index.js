if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const { allowCrossDomain, jwtRequired, validateRequest } = require("../../middlewares");

const app = module.exports = express();

const { ErrorHandler } = require("../../utils/error")

const createToken = require("../utils/createToken")
const { findUserByPk } = require("../users-dal");
const { post_auth } = require("./validations");

const validateCredentials = require("./validateCredentials");
const { jwtNotRequired, passUserOrCreateGuestFromJWT, passEmployeeFromJWT } = require("../../middlewares");

const getUserResponse = user => ({
    status: "success",
    code: 200,
    message: "Authorized",
    data: {
        token: createToken("userId",user.id),
        user
    }
})

const getEmployeeResponse = employee => ({
    status: "success",
    code: 200,
    message: "Authorized",
    data: {
        token: createToken("employeeId",employee.id),
        employee
    }
})

app.use(allowCrossDomain)

app.get('/auth', [jwtNotRequired, passUserOrCreateGuestFromJWT], async (req, res) => {
    return res.json(getUserResponse(req.user))
});

app.post('/auth', validateRequest(post_auth), async (req, res) => {
    let user = await validateCredentials(req.body)
    return res.json(getUserResponse(user))
});


const INVALID_CREDENTIALS_ERROR = new ErrorHandler(400, "Invalid credentials", [
    "Email or password is incorrect. Please try again."
])

app.get('/businesses/auth', [jwtNotRequired, passUserOrCreateGuestFromJWT], async (req, res) => {
    if (!req.user.BusinessId) throw new ErrorHandler(401,"Unauthorized")
    return res.json(getUserResponse(req.user))
});

app.post("/businesses/auth", validateRequest(post_auth), async (req,res) => {
    let user = await validateUserCredentials(req.body);
    if (!user.BusinessId) throw INVALID_CREDENTIALS_ERROR
    return res.json(getUserResponse(user))
})

app.get('/employee/auth', [jwtRequired, passEmployeeFromJWT], async (req, res) => {
    if (!employee) throw new ErrorHandler(401,"Unauthorized")
    return res.json(getEmployeeResponse(employee))
});

app.post("/employee/auth", validateRequest(post_auth), async (req,res) => {
    let employee = await validateEmployeeCredentials(req.body);
    if (!employee) throw INVALID_CREDENTIALS_ERROR
    return res.json(getEmployeeResponse(user))
})