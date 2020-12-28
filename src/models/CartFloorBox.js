"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let CartFloorBox = sequelize.define('CartFloorBox', { });
    
    CartFloorBox.associate = models => {
        CartFloorBox.belongsTo(models.FloorBox, { foreignKey: { allowNull: false } })
        CartFloorBox.belongsTo(models.Cart, { foreignKey: { allowNull: false } })
    }
    
    return CartFloorBox;
};