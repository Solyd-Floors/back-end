
const { Floor } = require("../../models");

module.exports = {
    findAll: async () => await Floor.findAll()
}