"use strict"

const { ErrorHandler } = require("../utils/error");
const { Floor } = require("../models")

console.log({Floor})

module.exports = (sequelize, DataTypes) => {
    let options = {
        defaultScope: { 
        }
    }
    let CartFloorItem = sequelize.define('CartFloorItem', {
        status: {
            type: DataTypes.ENUM("ACTIVE","REMOVED"),
            allowNull: false,
            defaultValue: "ACTIVE"
        },
        mil_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        boxes_amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        } 
    }, options);

    CartFloorItem.associate = models => {
        CartFloorItem.belongsTo(models.Cart, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.FloorTileSize, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.Floor, { foreignKey: { allowNull: false, primaryKey: true } })
    }
    
    return CartFloorItem;
};