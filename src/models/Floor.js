"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let Floor = sequelize.define('Floor', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumbnail_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    Floor.associate = models => {
        Floor.belongsTo(models.FloorCategory, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.FloorType, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.Color, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.Brand, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.User, { foreignKey: { allowNull: false } })
        Floor.belongsToMany(models.FloorTileSize, { 
            // foreignKey: { allowNull: false },
            through: models.FloorFloorTileSize ,
            foreignKey: "FloorId"
        })
    }
    
    return Floor;
};