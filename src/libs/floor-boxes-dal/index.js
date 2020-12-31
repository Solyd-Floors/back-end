
const { FloorBox, Sequelize } = require("../../models");

module.exports = {
    getFloorBoxesInfo: async ({
        mil_type, FloorId, FloorTileSizeId, limit, exclude_ids
    }) => {
        let where = { 
            mil_type, FloorId, FloorTileSizeId,
            status: "ACTIVE"
        }
        if (exclude_ids) where.id = {
            [Sequelize.Op.notIn]: exclude_ids
        }
        let floor_boxes = await FloorBox.findAll({ where, limit })
        let square_feet_available = floor_boxes.length * 23.4
        let data = {
            pallets: Math.floor(floor_boxes / 50),
            boxes: floor_boxes.length,
            square_feet_available
        } 
        // if (limit) data.floor_boxes = floor_boxes;
        return data
    }
}