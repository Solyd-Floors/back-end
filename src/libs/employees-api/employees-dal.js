
const { Employee } = require("../../models");

const SALT_ROUNDS = 10;

const bcrypt = require("bcrypt");
const { ErrorHandler } = require("../../utils/error");

const employeeEmailCheck = async (BusinessId,email) => {
    let exists = await Employee.count({ where: { BusinessId, email }})
    if (exists) throw new ErrorHandler(403,"ValidationError",[ "users.email must be unique" ])
    return true;
}

module.exports = {
    findAll: async () => await Employee.findAll(),
    createEmployee: async ({ email, password, full_name, BusinessId }) => {
        await employeeEmailCheck(BusinessId, email)
        return await Employee.create({ email, password, full_name, BusinessId })
    },
    updateEmployee: async ({pk,data}) => {
        let keys = Object.keys(data);
        let employee = await Employee.findByPkOr404(pk);
        for (let key of keys){
            if (key == "email") await employeeEmailCheck(employee.BusinessId,data[key])
            employee[key] = data[key]
            if (key == "password") employee[key] = await bcrypt.hash(data[key], SALT_ROUNDS)
        }
        await employee.save();
        return employee;
    },
    deleteEmployee: async (pk) => await (await (await Employee.findByPkOr404(pk))).destroy()
}