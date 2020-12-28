"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let FloorFloorTileSize = sequelize.define('FloorFloorTileSize', {});

    FloorFloorTileSize.associate = models => {
        FloorFloorTileSize.belongsTo(models.Floor, { foreignKey: { allowNull: false } });
        FloorFloorTileSize.belongsTo(models.FloorTileSize, { foreignKey: { allowNull: false } });
    }
    
    return FloorFloorTileSize;
};