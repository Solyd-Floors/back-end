
const { Floor, FloorTileSize } = require("../../models");

module.exports = {
    findOne: async pk => await Floor.findByPkOr404(pk, { include: [ FloorTileSize ]})
}