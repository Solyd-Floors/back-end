
const { FloorTileSize } = require("../../models");

module.exports = {
    findOne: async pk => await FloorTileSize.findByPkOr404(pk),
    findAll: async () => await FloorTileSize.findAll(),
    createFloorTileSize: async ({ 
        width, height
     }) => await FloorTileSize.create({ 
        width, height
     }),
     updateFloorTileSize: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_tile_size = await FloorTileSize.findByPkOr404(pk);
        for (let key of keys){
            floor_tile_size[key] = data[key]
        }
        await floor_tile_size.save();
        return floor_tile_size;
    },
    deleteFloorTileSize: async (pk) => await (await (await FloorTileSize.findByPkOr404(pk))).destroy()
}