
const { Employee } = require("../../models");

module.exports = {
    findAll: async () => await Employee.findAll()
}