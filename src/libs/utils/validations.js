
const yup = require("yup");

module.exports = {
    email: yup.string().email(),
    password: yup.string().min(8),
    param_id: yup.string()
        .test(val => val === undefined || !isNaN(Number(val)))
        .test(val => val === undefined || Number(val) > 0),
    id: yup.number().integer().positive()
}