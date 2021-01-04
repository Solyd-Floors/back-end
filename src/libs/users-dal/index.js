
const { User, Installer } = require("../../models")
const uuid = require("uuid")

module.exports = {
    findUserByPk: async pk => await User.findByPk(pk),
    doesUserHaveInstaller: async pk => Boolean(await Installer.findOne({ where: { UserId: pk}})),
    createGuestUser: async () => {
        let id = uuid.v1();
        return await User.create({
            email: `guest-${id}`,
            password: `guest-${id}`,
            full_name: `guest-${id}`,
            isGuest: true
        })
    }
}