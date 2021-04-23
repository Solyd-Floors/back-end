
const { FloorBox } = require("../../models");
const { ErrorHandler } = require("../../utils/error");
const { findOne: findOneFloor } = require("../floors-dal")
const uuid = require("uuid")

module.exports = {
    findOne: async pk => await FloorBox.findByPkOr404(pk),
    findAll: async () => await FloorBox.findAll(),
    createFloorBox: async ({ 
        mil_type, price, FloorId
     }) => {
        let SKU = `AUTO-${uuid.v1()}`;
        return await FloorBox.create({ 
            SKU, mil_type, price, FloorId
        })
    },
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