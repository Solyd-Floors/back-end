// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_employees, patch_employees, delete_employees } = require("./validations");
const { findAll } = require("./employees-dal");
const { ErrorHandler } = require("../../utils/error");
const createToken = require("../utils/createToken");
const { deleteEmployee, createEmployee, updateEmployee } = require("../employees-dal");

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
    validateRequest(post_employees)
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
    validateRequest(patch_employees)
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
    validateRequest(delete_employees)
], async (req,res) => {
    await deleteEmployee(req.params.employee_id)
    return res.json({
        code: 204,
        message: "success"
    })
})