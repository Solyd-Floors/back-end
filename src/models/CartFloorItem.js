"use strict"

const { ErrorHandler } = require("../utils/error");
const { Floor } = require("../models");
const getPrice = require("../utils/getPrice");

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
        },
        total_price: {
            type: DataTypes.VIRTUAL,
            set: function(val) {
                let boxes_amount = this.get("boxes_amount")
                let mil_type = this.get("mil_type")
                let price_per_sqft = getPrice(mil_type)
                return boxes_amount * price_per_sqft
            }
        }
    }, options);

    CartFloorItem.associate = models => {
        CartFloorItem.belongsTo(models.Cart, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.FloorTileSize, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.Floor, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.ShipToAddress)
        CartFloorItem.belongsTo(models.Installation)
    }
    
    return CartFloorItem;
};