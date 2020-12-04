
const { Floor } = require("../../models");

module.exports = {
    findAll: async () => await Floor.findAll(),
    createFloor: async ({ 
        name, thumbnail_url, price, quantity, 
        FloorCategoryId, FloorId,
        BrandId, UserId,
     }) => await Floor.create({ 
        name, thumbnail_url, price,
        quantity, FloorCategoryId, 
        FloorId, BrandId, UserId,
     }),
     updateFloor: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor = await Floor.findByPkOr404(pk);
        for (let key of keys){
            floor[key] = data[key]
        }
        await floor.save();
        return floor;
    },
    deleteFloor: async (pk) => await (await (await Floor.findByPkOr404(pk))).destroy()
}