// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, 
    validateRequest, 
    jwtRequired, 
    passUserFromJWT, 
    adminRequired,
    passBusinessFromJWT
} = require("../../middlewares");

const { get_employees_employee_id, post_my_business_employees, patch_my_business_employees } = require("./validations");
const {  } = require("./my-business-dal");
const { ErrorHandler } = require("../../utils/error");
const { createEmployee, findEmployeesByBusiness, findEmployeeByIdAndBusinessId, deleteEmployee, updateEmployee } = require("../employees-dal");

app.use(allowCrossDomain)

app.get("/my_business/employees", [
    jwtRequired, passBusinessFromJWT
], async (req,res) => {
    let employees = await findEmployeesByBusiness(req.business.id);
    return res.json({
        message: "success",
        code: 200,
        data: { employees }
    })
})

app.get("/my_business/employees/:employee_id", [
    jwtRequired, passBusinessFromJWT,
    validateRequest(get_employees_employee_id)
], async (req,res) => {
    let employee = await findEmployeeByIdAndBusinessId({
        id: req.params.employee_id,
        BusinessId: req.business.id
    });
    if (!employee) throw new ErrorHandler(404, "Not found", "Employee not found.")
    return res.json({
        message: "success",
        code: 200,
        data: { employee }
    })
})

app.delete("/my_business/employees/:employee_id", [
    jwtRequired, passBusinessFromJWT,
    validateRequest(get_employees_employee_id)
], async (req,res) => {
    let employee = await findEmployeeByIdAndBusinessId({
        id: req.params.employee_id,
        BusinessId: req.business.id
    });
    if (!employee) throw new ErrorHandler(404, "Not found", "Employee not found.")
    await deleteEmployee(employee.id);
    return res.json({
        message: "success",
        code: 200,
        data: { employee }
    })
})

app.post("/my_business/employees",[
    jwtRequired, passBusinessFromJWT,
    validateRequest(post_my_business_employees)
], async (req,res) => {
    let employee = await createEmployee({
        ...req.body,
        BusinessId: req.business.id
    });
    return res.json({
        code: 200,
        message: "success",
        data: { employee }
    })
})

app.patch("/my_business/employees/:employee_id",[
    jwtRequired, passBusinessFromJWT,
    validateRequest(patch_my_business_employees)
], async (req,res) => {
    let employee = await updateEmployee({
        pk: req.params.employee_id,
        data: {
            ...req.body
        }
    });
    return res.json({
        code: 200,
        message: "success",
        data: { employee }
    })
})