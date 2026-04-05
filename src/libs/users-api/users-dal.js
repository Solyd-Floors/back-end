
const { User } = require("../../models")
const { v1: uuid } = require('uuid')

const SALT_ROUNDS = 10;

const bcrypt = require("bcrypt");
const { ErrorHandler } = require("../../utils/error");
const { linkStripeCustomer } = require("../users-dal");
const uploadFile = require("../aws/uploadFile");

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
        email, first_name, last_name, phone, address, password, picture_image
    }) => {
        const args = {
            first_name, last_name, phone, address, email, 
            password: await bcrypt.hash(password, SALT_ROUNDS), points: 0, 
        }
        if (picture_image) args.picture_url = await uploadFile(picture_image)

        let user = await User.create(args)
        user = await linkStripeCustomer({ user })
        return user;
    },
    createUserUnrestricted: async ({
        first_name, last_name, phone, address,
        email, password, picture_image
    }) => {
        let args = { first_name, last_name, phone, address, email }
        if (password) args.password = await bcrypt.hash(password, SALT_ROUNDS)
        if (picture_image) args.picture_url = await uploadFile(picture_image)

        let user = await User.create(args)
        user = await linkStripeCustomer({ user })
        return user; 
    },
    updateUser: async ({pk,data}) => {
        let keys = Object.keys(data);
        let user = await User.findByPk(pk);
        for (let key of keys){
            if (key === 'picture_image'){
                user.picture_url = await uploadFile(data[key])
            } else {
                user[key] = key === "password" ? await bcrypt.hash(data[key], SALT_ROUNDS) : data[key]
            }
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
