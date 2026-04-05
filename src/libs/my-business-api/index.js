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

const { findShipToAddressByBusinessId, deleteShipToAddress, createShipToAddress, findOneShipToAddressOr404, findBusinessOrders } = require("./my-business-dal");
const { ErrorHandler } = require("../../utils/error");
const { createEmployee, findEmployeesByBusiness, findEmployeeByIdAndBusinessId, deleteEmployee, updateEmployee } = require("../employees-dal");
const { getUserActiveCart } = require("../me-dal");
const yup = require("yup")
const { param_id } = require("../utils/validations")

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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        })
    }))
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
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            employee_id: param_id.required()
        }),
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
        })
    }))
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
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            address: yup.string().required()
        })
    }))
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
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            ship_to_address_id: param_id.required()
        })
    }))
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