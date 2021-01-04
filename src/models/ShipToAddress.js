"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let ShipToAddress = sequelize.define('ShipToAddress', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, options);

    ShipToAddress.associate = models => {
        ShipToAddress.belongsTo(models.Order)
        ShipToAddress.belongsTo(models.CartFloorItem)
    }
    
    return ShipToAddress;
};