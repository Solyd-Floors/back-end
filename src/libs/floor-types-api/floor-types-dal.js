
const { FloorType } = require("../../models");

module.exports = {
    findAll: async () => await FloorType.findAll(),
    createFloorType: async ({ name }) => await FloorType.create({ name }),
    updateFloorType: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_type = await FloorType.findByPkOr404(pk);
        for (let key of keys){
            floor_type[key] = data[key]
        }
        await floor_type.save();
        return floor_type;
    },
    deleteFloorType: async (pk) => await (await (await FloorType.findByPkOr404(pk))).destroy()
}