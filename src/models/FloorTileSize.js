"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let FloorTileSize = sequelize.define('FloorTileSize', {
        width: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    FloorTileSize.associate = models => {
    }
    
    return FloorTileSize;
};