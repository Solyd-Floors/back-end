
const { FloorBox } = require("../../models");

module.exports = {
    getFloorBoxesInfo: async ({
        mil_type, FloorId, FloorTileSizeId
    }) => {
        let floor_boxes = await FloorBox.findAll({
            where: { 
                mil_type, FloorId, FloorTileSizeId
            }
        })
        let square_feet_available = floor_boxes.length * 23.4
        return {
            pallets: Math.floor(floor_boxes / 50),
            boxes: floor_boxes.length,
            square_feet_available,
        } 
    }
}