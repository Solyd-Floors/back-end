
const { FloorBox } = require("../../models");

module.exports = {
    findOne: async pk => await FloorBox.findByPkOr404(pk),
    findAll: async () => await FloorBox.findAll(),
    createFloorBox: async ({ 
        SKU, mil_type, FloorTileSizeId, FloorId
     }) => await FloorBox.create({ 
        SKU, mil_type, FloorTileSizeId, FloorId
     }),
     updateFloorBox: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_box = await FloorBox.findByPkOr404(pk);
        for (let key of keys){
            floor_box[key] = data[key]
        }
        return floor_box;
    },
    deleteFloorBox: async (pk) => await (await (await FloorBox.findByPkOr404(pk))).destroy()
}