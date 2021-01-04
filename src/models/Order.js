"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let Order = sequelize.define('Order', {
        status: {
            type: DataTypes.ENUM(
                "WAITING_CONFIRMATION",
                "CONFIRMED",
                "SHIPPING",
                "DELIVERED",
                "CANCELED",
                "REFUSED"
            ),
            allowNull: false,
            defaultValue: "WAITING_CONFIRMATION"
        }
    });
    Order.get_status_list = () => {
        return [
            "WAITING_CONFIRMATION",
            "CONFIRMED",
            "SHIPPING",
            "DELIVERED",
            "CANCELED",
            "REFUSED"
        ]
    }
    Order.associate = models => {
        Order.belongsTo(models.User, { foreignKey: { allowNull: false } })
        Order.belongsTo(models.Cart, { foreignKey: { allowNull: false } })
        Order.belongsTo(models.Invoice, { foreignKey: { allowNull: false } })
        Order.belongsTo(models.Installation)
        Order.hasOne(models.ShipToAddress)
    }
    
    return Order;
};