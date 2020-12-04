
const { Brand } = require("../../models");

module.exports = {
    findAll: async () => await Brand.findAll(),
    createBrand: async ({ name }) => await Brand.create({ name }),
    updateBrand: async ({ pk, name }) => await (await (await Brand.findByPkOr404(pk))).update({ name }),
    deleteBrand: async (pk) => await (await (await Brand.findByPkOr404(pk))).destroy()
}