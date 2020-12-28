"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let OrderStatusChangeLog = sequelize.define('OrderStatusChangeLog', {
        from: {
            type:  DataTypes.STRING,
            allowNull: false,
        },
        to: {
            type:  DataTypes.STRING,
            allowNull: false,
        },
    });

    OrderStatusChangeLog.associate = models => {
        OrderStatusChangeLog.belongsTo(models.Order, { foreignKey: { allowNull: false } })
    }
    
    return OrderStatusChangeLog;
};