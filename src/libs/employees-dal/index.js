const { Employee } = require("../../models");


module.exports = {
    findEmployeeByPk: async pk => await Employee.findByPkOr404(pk)
}