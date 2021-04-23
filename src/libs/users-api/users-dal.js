
const { User } = require("../../models")
const { v1: uuid } = require('uuid')

const SALT_ROUNDS = 10;

const bcrypt = require("bcrypt");
const { ErrorHandler } = require("../../utils/error");
const { createCustomer } = require("../stripe");

//  TODO: On Stripe fail, handle it
module.exports = {
    findByPk: async pk => await User.findByPkOr404(pk),
    findAll: async () => await User.findAll(),
    deleteUser: async pk => {
        let user = await User.findByPkOr404(pk)
        user.destroy();
        return true;
    },
    createUser: async ({
        email, first_name, last_name, phone, address, password
    }) => {
        let user = await User.create({
            first_name, last_name, phone, address, email, 
            password: await bcrypt.hash(password, SALT_ROUNDS), points: 0, 
        })
        let { id: customer_id } = await createCustomer({ user });
        user.customer_id = customer_id;
        await user.save();
        return user;
    },
    createUserUnrestricted: async ({
        first_name, last_name, phone, address,
        email, password
    }) => {
        let args = { first_name, last_name, phone, address, email }
        if (password) args.password = await bcrypt.hash(password, SALT_ROUNDS)
        let user = await User.create(args)
        user.customer_id = await createCustomer({ user });
        await user.save();
        return user; 
    },
    updateUser: async ({pk,data}) => {
        let keys = Object.keys(data);
        let user = await User.findByPk(pk);
        for (let key of keys){
            user[key] = key === "password" ? await bcrypt.hash(data[key], SALT_ROUNDS) : data[key]
        }
        await user.save();
        return user;
    },
    findUserByEmail: async (email,scope) => {
        let model = User;
        if (scope) model = model.scope(scope)
        let user = await model.findOne({ where: { email } });
        if (!user) throw new ErrorHandler(404, `User with email=${email} not found!`)
        return user;
    }
}