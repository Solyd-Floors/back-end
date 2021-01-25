const { ErrorHandler } = require("../../utils/error")
const bcrypt = require("bcrypt")

let { User, Employee } = require("../../models")

const INVALID_CREDENTIALS_ERROR = new ErrorHandler(400, "Invalid credentials", [
    "Email or password is incorrect. Please try again."
])

let validateCredentials = model =>  async ({ email, password, BusinessId }) => {
    let where = { email }
    if (BusinessId) where.BusinessId = BusinessId;
    let obj = await model.scope('withPassword').findOne({ where })
    if (!obj) throw INVALID_CREDENTIALS_ERROR
    const match = await bcrypt.compare(password, obj.password);
    obj.password = undefined
    if (match) return obj;
    else throw INVALID_CREDENTIALS_ERROR
}


module.exports = {
    validateEmployeeCredentials: validateCredentials(Employee),
    validateUserCredentials: validateCredentials(User),
}