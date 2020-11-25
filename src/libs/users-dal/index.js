
const { User } = require("../../models")

module.exports = {
    findUserByPk: async pk => await User.findByPk(pk),
    doesUserHaveInstaller: async pk => (await User.findByPk(pk)).InstallerId !== undefined
}