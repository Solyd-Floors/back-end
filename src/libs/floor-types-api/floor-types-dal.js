
const { FloorType } = require("../../models");

module.exports = {
    findAll: async () => await FloorType.findAll()
}