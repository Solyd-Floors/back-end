"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let Order = sequelize.define('Order', {
        status: {
            type: DataTypes.ENUM(
                "WAITING_CONFIRMATION",
                "NOT_CONFIRMED",
                "CONFIRMED",
                "SHIPPING",
                "DELIVERED",
                "CANCELED"
            ),
            allowNull: false,
            defaultValue: "WAITING_CONFIRMATION"
        },
    });

    Order.associate = models => {
        Order.belongsTo(models.User, { foreignKey: { allowNull: false } })
        Order.belongsTo(models.Cart, { foreignKey: { allowNull: false } })
        Order.belongsTo(models.Invoice, { foreignKey: { allowNull: false } })
        Order.belongsTo(models.Installation)
    }
    
    return Order;
};