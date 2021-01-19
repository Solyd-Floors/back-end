"use strict"

const { ErrorHandler } = require("../utils/error");
const { Floor } = require("../models");
const getPrice = require("../utils/getPrice");

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
                let mil_type = this.get("mil_type")
                let FloorId = this.get("FloorId")
                let boxes_amount = this.get("boxes_amount")
                console.log({mil_type, FloorId, boxes_amount})
                let floor_boxes = FloorBox.findAll({ where: { mil_type, FloorId }, limit: boxes_amount})
                let prices = floor_boxes.map(x => x.price);
                return prices.reduce((a,b) => a + b)
            }
        },
        square_feet: {
            type: DataTypes.VIRTUAL,
            set: function(val) {
                return 23.4
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