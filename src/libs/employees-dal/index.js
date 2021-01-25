const { Employee } = require("../../models");
const { ErrorHandler } = require("../../utils/error");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const employeeEmailCheck = async (BusinessId,email,onUpdate) => {
    let exists = await Employee.count({ where: { BusinessId, email }})
    let check = onUpdate ? exists > 1 : exists
    console.log({BusinessId, email, check, onUpdate, exists})
    if (check) throw new ErrorHandler(403,"ValidationError",[ `users.email must be unique ${BusinessId}-${email}` ])
    return true;
}

module.exports = {
    employeeEmailCheck,
    findEmployeeByPk: async pk => await Employee.findByPkOr404(pk),
    findEmployeesByBusiness: async BusinessId => await Employee.findAll({ where: { BusinessId }}),
    findEmployeeByIdAndBusinessId: async ({ id, BusinessId }) => await Employee.findOne({
        where: { id, BusinessId }
    }),
    deleteEmployee: async (pk) => await (await (await Employee.findByPkOr404(pk))).destroy(),
    createEmployee: async ({ 
        email, password, first_name, last_name, 
        address, address2, phone_number, city, state,
        BusinessId, country, postcode 
    }) => {
        await employeeEmailCheck(BusinessId, email)
        return await Employee.create({ 
            email, password: await bcrypt.hash(password, SALT_ROUNDS), first_name, last_name, 
            address, address2, phone_number, city, state,
            BusinessId, country, postcode 
        })
    },
    updateEmployee: async ({pk,data}) => {
        let keys = Object.keys(data);
        let employee = await Employee.findByPkOr404(pk);
        for (let key of keys){
            if (key == "email") await employeeEmailCheck(employee.BusinessId,data[key],true)
            employee[key] = data[key]
            if (key == "password") employee[key] = await bcrypt.hash(data[key], SALT_ROUNDS)
        }
        await employee.save();
        return employee;
    }
}