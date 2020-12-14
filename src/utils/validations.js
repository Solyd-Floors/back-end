
const yup = require("yup");

module.exports = {
    id: yup.integer().max(1000000),
}