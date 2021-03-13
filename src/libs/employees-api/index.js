// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll } = require("./employees-dal");
const { ErrorHandler } = require("../../utils/error");
const createToken = require("../utils/createToken");
const { deleteEmployee, createEmployee, updateEmployee } = require("../employees-dal");
const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

app.get("/employees", async (req,res) => {
    let employees = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { employees }
    })
})

app.post("/employees",[
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            email: yup.string().email().required(),
            password: yup.string().min(8).required(),
            first_name: yup.string().required(),
            last_name: yup.string().required(),
            address: yup.string(),
            address2: yup.string(),
            city: yup.string(),
            state: yup.string(),
            country: yup.string(),
            postcode: yup.string(),
            phone_number: yup.string(),
            BusinessId: id.required()
        })
    }))
], async (req,res) => {
    let employee = await createEmployee(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { employee, token: createToken("employeeId",employee.id) }
    })
})

app.patch("/employees/:employee_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            email: yup.string().email(),
            password: yup.string().min(8),
            first_name: yup.string().required(),
            last_name: yup.string().required(),
            address: yup.string(),
            address2: yup.string(),
            city: yup.string(),
            state: yup.string(),
            country: yup.string(),
            postcode: yup.string(),
            phone_number: yup.string(),
            BusinessId: id.required()
        }),
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    }))
], async (req,res) => {
    let employee = await updateEmployee({
        pk: req.params.employee_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { employee }
    })
})

app.delete("/employees/:employee_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteEmployee(req.params.employee_id)
    return res.json({
        code: 204,
        message: "success"
    })
})