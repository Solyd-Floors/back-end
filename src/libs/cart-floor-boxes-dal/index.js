
const { CartFloorBox, FloorBox } = require("../../models")

module.exports = {
    findAll: async ({
        CartId, mil_type, FloorId, FloorTileSizeId
    }) => await CartFloorBox.findAll({
        where: { 
            CartId 
        },
        include: [
            {
                model: FloorBox, 
                where: { mil_type, FloorId, FloorTileSizeId },
                required: true
            }
        ]
    }),
    createCartFloorBox: async ({ CartId, FloorBoxId }) => {
        return await CartFloorBox.create({
            CartId, FloorBoxId
        })
    }
}