
const { Country } = require("../../models");

module.exports = {
    findAll: async () => await Country.findAll(),
    createCountry: async ({ name }) => await Country.create({ name })
}