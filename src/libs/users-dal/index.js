
const { User, Installer } = require("../../models")
const uuid = require("uuid");
const { createCustomer } = require("../stripe");

module.exports = {
    findUserByPk: async pk => await User.findByPk(pk),
    doesUserHaveInstaller: async pk => Boolean(await Installer.findOne({ where: { UserId: pk}})),
    createGuestUser: async () => {
        let id = uuid.v1();
        let user = await User.create({
            email: `guest-${id}`,
            password: `guest-${id}`,
            first_name: `guest-${id}`,
            last_name: `guest-${id}`,
            isGuest: true
        })
        let { id: customer_id } = await createCustomer({ user });
        user.customer_id = customer_id;
        await user.save();
        return user;
    }
}