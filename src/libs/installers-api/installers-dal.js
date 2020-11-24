
const { Installer } = require("../../models");

module.exports = {
    findAll: async () => await Installer.findAll()
}