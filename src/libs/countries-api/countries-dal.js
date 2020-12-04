
const { Country } = require("../../models");

module.exports = {
    findAll: async () => await Country.findAll(),
    createCountry: async ({ name }) => await Country.create({ name }),
    updateCountry: async ({ pk, name }) => {
        let country = await Country.findByPkOr404(pk);
        country.name = name;
        await country.save();
        return country;
    },
    deleteCountry: async (pk) => await (await Country.findByPkOr404(pk)).destroy()
}