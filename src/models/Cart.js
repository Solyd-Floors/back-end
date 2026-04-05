"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = {
        defaultScope: { 
            include: { all: true }
        }
    }
    let Cart = sequelize.define('Cart', {
        status: {
            type: DataTypes.ENUM("ACTIVE","DISCARDED","COMPLETED"),
            allowNull: false,
            defaultValue: "ACTIVE"
        },
        woo_order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });

    Cart.associate = models => {
        Cart.belongsTo(models.User)
        Cart.belongsTo(models.Employee)
        Cart.hasMany(models.CartFloorItem, { foreignKey: { allowNull: false } })
    }
    
    return Cart;
};
