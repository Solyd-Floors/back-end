
const { Brand } = require("../../models");

module.exports = {
    findAll: async () => await Brand.findAll()
}