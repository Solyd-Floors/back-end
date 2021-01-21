
const { Floor, FloorTileSize, FloorBox } = require("../../models");

module.exports = {
    findOne: async pk => await Floor.findByPkOr404(pk, { include: [ FloorTileSize ]}),
    getFloorPrice: async ({ id: FloorId, FloorTileSizes }) => {
        let FloorTileSizeId = FloorTileSizes[0].id;
        if (!FloorTileSizeId) return "N/A"
        let floor_box = await FloorBox.findOne({
            where: { FloorId, FloorTileSizeId, mil_type: 12 }
        })
        if (!floor_box) return "N/A"
        return floor_box.price
    }
}