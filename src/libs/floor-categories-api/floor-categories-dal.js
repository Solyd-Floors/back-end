
const { FloorCategory } = require("../../models");

module.exports = {
    findAll: async () => await FloorCategory.findAll()
}