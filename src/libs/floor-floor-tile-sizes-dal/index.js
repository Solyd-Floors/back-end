
const { FloorTileSize, Floor, FloorFloorTileSize } = require("../../models");

const removeFloorFloorTileSize = async ({ floor, floor_tile_size_id }) => {
    let instance = await FloorFloorTileSize.findOne({ 
        where: {
            FloorId: floor.id,
            FloorTileSizeId: floor_tile_size_id
        }
    })
    await instance.destroy();
    return instance;
}

const addFloorFloorTileSize = async ({ floor, floor_tile_size_id }) => {
    return await FloorFloorTileSize.create({
        FloorId: floor.id,
        FloorTileSizeId: floor_tile_size_id
    })
}

module.exports = {
    updateFloorTileSizes: async ({floor_pk, floor: fb_instance, floor_tile_sizes}) => {
        let floor = fb_instance || await Floor.findByPkOr404(floor_pk)
        let current_floor_floor_tile_sizes = await FloorFloorTileSize.findAll({
            where: { FloorId: floor.id }
        })
        let operations = [];
        let current_floor_tile_sizes = current_floor_floor_tile_sizes.map(x => x.FloorTileSizeId);
        for (let floor_tile_size_id of floor_tile_sizes){
            if (current_floor_tile_sizes.indexOf(floor_tile_size_id) === -1) {
                let op = addFloorFloorTileSize({ floor, floor_tile_size_id})
                operations.push(op)
            }
        }
        current_floor_tile_sizes.map(x => {
            let floor_tile_size_id = x
            if (floor_tile_sizes.indexOf(x) === -1){
                let op = removeFloorFloorTileSize({ floor, floor_tile_size_id})
                operations.push(op)
            }
        })
        console.log("COMPLETING ", operations.length, " OPERATIONS")
        return await Promise.all(operations)
    },
    getFloorWithFloorTileSizes: async ({ floor_pk, floor: fb_instance }) => {
        let floor = fb_instance || await Floor.findByPkOr404(floor_pk)
        let floor_floor_tile_sizes = await FloorFloorTileSize.findAll({
            where: { FloorId: floor.id }
        })
        let floor_tile_sizes = await Promise.all([
            ...floor_floor_tile_sizes.map(x => FloorTileSize.findByPkOr404(x.FloorTileSizeId))
        ])
        floor = JSON.parse(JSON.stringify(floor));
        floor.FloorTileSizes = floor_tile_sizes;
        return floor;
    }
}