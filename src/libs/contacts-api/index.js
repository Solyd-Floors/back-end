if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { post_contacts } = require("./validations");
const { findAll, createContact, updateContact, deleteContact } = require("./contacts-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");

app.use(allowCrossDomain)

app.get("/contacts", async (req,res) => {
    let contacts = await findAll();
    return res.json({
        code: 200,
        message: "success",
        data: { contacts }
    })
})

app.patch("/contacts/:contact_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape({
            first_name: yup.string().required(),
            last_name: yup.string().required(),
            email: yup.string().required(),
            reason: yup.string().required(),
        })
    }))
], async (req,res) => {
    let contact = await updateContact({ 
        pk: Number(req.params.contact_id),
        name: req.body.name
    })
    return res.json({
        code: 204,
        message: "success",
        data: { contact }
    })
})

app.post("/contacts", [
    validateRequest(post_contacts),
    jwtRequired, passUserFromJWT
], async (req,res) => {
    let contact = await createContact(req.body);
    return res.json({
        code: 201,
        message: "success",
        data: { contact }
    })
})

app.delete("/contacts/:contact_id", [
    jwtRequired, passUserFromJWT, adminRequired,
], async (req,res) => {
    await deleteContact(req.params.contact_id);
    return res.json({
        code: 204,
        message: "success"
    })
})