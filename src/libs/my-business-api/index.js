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

const { get_employees_employee_id, post_my_business_employees, patch_my_business_employees, post_my_business_ship_to_addresses, delete_my_business_ship_to_addresses } = require("./validations");
const { findShipToAddressByBusinessId, deleteShipToAddress, createShipToAddress, findOneShipToAddressOr404, findBusinessOrders } = require("./my-business-dal");
const { ErrorHandler } = require("../../utils/error");
const { createEmployee, findEmployeesByBusiness, findEmployeeByIdAndBusinessId, deleteEmployee, updateEmployee } = require("../employees-dal");
const { getUserActiveCart } = require("../me-dal");

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

app.get("/my_business/orders", [
    jwtRequired, passBusinessFromJWT
], async (req,res) => {
    let orders = await findBusinessOrders(req.business.UserId);
    return res.json({
        code: 200,
        message: "success",
        data: { orders }
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

app.get("/my_business/ship_to_addresses", [
    jwtRequired, passBusinessFromJWT
], async (req,res) => {
    let ship_to_addresses = await findShipToAddressByBusinessId(req.business.id)
    return res.json({
        code: 200,
        message: "success",
        data: { ship_to_addresses }
    })
})

app.get("/my_business/ship_to_addresses/:ship_to_address_id", [
    jwtRequired, passBusinessFromJWT
], async (req,res) => {
    let ship_to_address = await findOneShipToAddressOr404({
        pk: req.params.ship_to_address_id,
        BusinessId: req.business.id
    })
    return res.json({
        code: 200,
        message: "success",
        data: { ship_to_address }
    })
})

app.post("/my_business/ship_to_addresses", [
    jwtRequired, passBusinessFromJWT,
    validateRequest(post_my_business_ship_to_addresses)
], async (req,res) => {
    let ship_to_address = await createShipToAddress({
        BusinessId: req.business.id,
        address: req.body.address
    })
    return res.json({
        code: 200,
        message: "success",
        data: { ship_to_address }
    })
})

app.delete("/my_business/ship_to_addresses/:ship_to_address_id", [
    jwtRequired, passBusinessFromJWT,
    validateRequest(delete_my_business_ship_to_addresses)
], async (req,res) => {
    let ship_to_address = await deleteShipToAddress({
        BusinessId: req.business.id,
        pk: req.params.ship_to_address_id
    })
    return res.json({
        code: 200,
        message: "success",
        data: { ship_to_address }
    })
})

app.get("/my_business/cart", [
    jwtRequired, passBusinessFromJWT
], async (req,res) => {
    let cart = await getUserActiveCart({ UserId: req.business.UserId })
    return res.json({
        code: 200,
        message: "success",
        data: { cart }
    })
})