
const { FloorCategory } = require("../../models");

module.exports = {
    findAll: async () => await FloorCategory.findAll(),
    createFloorCategory: async ({ name }) => await FloorCategory.create({ name }),
    updateFloorCategory: async ({pk,data}) => await FloorCategory.customUpdate({pk,data}),
    deleteFloorCategory: async (pk) => await (await (await FloorCategory.findByPkOr404(pk))).destroy()
}
