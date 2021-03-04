"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = {
        // defaultScope: { 
        //     include: { all: true }
        // }
    }
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
        __typename: {
            type: DataTypes.VIRTUAL,
            get: function(val){
                return "Floor"
            }
        }
    }, options);

    Floor.associate = models => {
        Floor.belongsTo(models.FloorCategory, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.FloorType, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.Color, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.User, { foreignKey: { allowNull: false } })
        Floor.belongsToMany(models.FloorTileSize, { 
            // foreignKey: { allowNull: false },
            through: models.FloorFloorTileSize ,
            foreignKey: "FloorId"
        })
    }
    
    return Floor;
};