
const { FloorCategory } = require("../../models");
const wp_categories = require("../wordpress-db/categories")

const _wp_to_sf = wp_category => {
    const { term_id: id, name, slug } = wp_category;
    const sf_category = { id, name, slug }
    return sf_category
}
const wp_to_sf = data => {
    const isArray = data.length !== undefined
    if (isArray){
        return data.map(d => _wp_to_sf(d))
    }
    return _wp_to_sf(data);
}

module.exports = {
    findAll: async () => wp_to_sf(await wp_categories.findAll()),
    createFloorCategory: async ({ name }) => await FloorCategory.create({ name }),
    updateFloorCategory: async ({pk,data}) => await FloorCategory.customUpdate({pk,data}),
    deleteFloorCategory: async (pk) => await (await (await FloorCategory.findByPkOr404(pk))).destroy()
}
