if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const { allowCrossDomain, jwtRequired, validateRequest } = require("../../middlewares");

const app = module.exports = express();

const { ErrorHandler } = require("../../utils/error")

const createToken = require("../utils/createToken")
const { findUserByPk } = require("../users-dal");

const { validateUserCredentials, validateEmployeeCredentials } = require("./validateCredentials");
const { jwtNotRequired, passUserOrCreateGuestFromJWT, passEmployeeFromJWT } = require("../../middlewares");
const { findByUserPk: findBusinessByUserPk } = require("../businesses-dal");
const passBusinessFromJWT = require("../../middlewares/passBusinessFromJWT");

const yup = require("yup");
const { email, password, id } = require("../utils/validations");
const jts_interpreter = require("../../jts_interpreter");
const { getCustomer } = require("../stripe");

jts_interpreter.add_tag({
    name: "Auth",
    description: "Authentication related API endpoints"
})

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

const getBusinessResponse = business => ({
    status: "success",
    code: 200,
    message: "Authorized",
    data: {
        token: createToken("businessId",business.id),
        business
    }
})

app.use(allowCrossDomain)

app.get('/auth', [
    jwtNotRequired, passUserOrCreateGuestFromJWT,
    validateRequest(
        yup.object().meta({ path: "/auth", method: "get", security: "jwt_auth", tag: "Auth" })
    ,true, { auto_docs_enabled: true })
], async (req, res) => {
    let user = JSON.parse(JSON.stringify(req.user));
    user.customer = await getCustomer({ customer_id: user.customer_id })
    return res.json(getUserResponse(user))
});

app.post('/auth', validateRequest(
    yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
        }).required()
    }).meta({ path: "/auth", method: "post", tag: "Auth" })
    ,true, { auto_docs_enabled: true }), async (req, res) => {
    let user = await validateUserCredentials(req.body)
    return res.json(getUserResponse(user))
});


const INVALID_CREDENTIALS_ERROR = new ErrorHandler(400, "Invalid credentials", [
    "Email or password is incorrect. Please try again."
])

app.get('/businesses/auth', [
    jwtRequired, passBusinessFromJWT,
    validateRequest(
        yup.object().meta({ path: "/businesses/auth", method: "get", security: "jwt_auth", tag: "Auth" })
    ,true, { auto_docs_enabled: true })
], async (req, res) => {
    return res.json(getBusinessResponse(req.business))
});

app.post("/businesses/auth", validateRequest(
    yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
        }).required()
    }).meta({ path: "/businesses/auth", method: "post", tag: "Auth" })
    ,true, { auto_docs_enabled: true }), async (req,res) => {
    let user = await validateUserCredentials(req.body);
    let business = await findBusinessByUserPk(user.id);
    console.log({user,business})
    if (!business) throw INVALID_CREDENTIALS_ERROR
    return res.json(getBusinessResponse(business))
})

app.get('/employee/auth', [
    jwtRequired, passEmployeeFromJWT,
    validateRequest(
        yup.object().meta({
            path: "/employee/auth",
            method: "get", security: "jwt_auth",
            tag: "Auth"
        })
    ,true, { auto_docs_enabled: true })
], async (req, res) => {
    if (!req.employee) throw new ErrorHandler(401,"Unauthorized")
    return res.json(getEmployeeResponse(req.employee))
});

app.post("/employee/auth", [
    validateRequest(
        yup.object().shape({
            requestBody: yup.object().shape({
                BusinessId: id.required(),
                email: email.required(),
                password: password.required(),
            }).required()
        }).meta({ path: "/employee/auth", method: "post", tag: "Auth" })
    , true, { auto_docs_enabled: true })
], async (req,res) => {
    let employee = await validateEmployeeCredentials(req.body);
    if (!employee) throw INVALID_CREDENTIALS_ERROR
    return res.json(getEmployeeResponse(employee))
})
