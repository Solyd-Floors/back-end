const { ErrorHandler } = require("../../utils/error")
const bcrypt = require("bcrypt")

let { User, Employee } = require("../../models")

const INVALID_CREDENTIALS_ERROR = new ErrorHandler(400, "Invalid credentials", [
    "Email or password is incorrect. Please try again."
])

let validateCredentials = model =>  async ({ email, password }) => {
    let obj = await model.scope('withPassword').findOne({ where: { email } })
    if (!obj) throw INVALID_CREDENTIALS_ERROR
    const match = await bcrypt.compare(password, obj.password);
    obj.password = undefined
    if (match) return obj;
    else throw INVALID_CREDENTIALS_ERROR
}


module.exports = {
    validateEmployeeCrendetials: validateCredentials(Employee),
    validateUserCrendetials: validateCredentials(User),
}