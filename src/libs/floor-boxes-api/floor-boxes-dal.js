
const { FloorBox } = require("../../models");
const { ErrorHandler } = require("../../utils/error");
const { findOne: findOneFloor } = require("../floors-dal")

let checkFloorTileSizeId = async ({
    FloorTileSizeId, FloorId
}) => {
    let floor = await findOneFloor(FloorId);
    let allowed = floor.FloorTileSizes.find(x => x.id === FloorTileSizeId)
    if (!allowed) throw new ErrorHandler(403,"Invalid FloorTileSizeId", [
        "The floor does not support that FloorTileSize"
    ])
    return true
}

module.exports = {
    findOne: async pk => await FloorBox.findByPkOr404(pk),
    findAll: async () => await FloorBox.findAll(),
    createFloorBox: async ({ 
        SKU, mil_type, FloorTileSizeId, FloorId
     }) => {
        await checkFloorTileSizeId({FloorId, FloorTileSizeId})
        return await FloorBox.create({ 
            SKU, mil_type, FloorTileSizeId, FloorId
        })
    },
     updateFloorBox: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_box = await FloorBox.findByPkOr404(pk);
        for (let key of keys){
            if (key === "FloorTileSizeId"){
                await checkFloorTileSizeId({
                    FloorId: floor_box.id, 
                    FloorTileSizeId: data[key]
                })
            }
            floor_box[key] = data[key]
        }
        return floor_box;
    },
    deleteFloorBox: async (pk) => await (await (await FloorBox.findByPkOr404(pk))).destroy()
}