
const { findEmployeeByPk } = require("../libs/employees-dal");
const { ErrorHandler } = require("../utils/error")

module.exports = async (req, res, next) => {
    req.employee = await findEmployeeByPk(req.auth.employeeId)
    if (!req.employee) throw new ErrorHandler(401, "Unauthorized")
    return next();
}