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
    });

    Cart.associate = models => {
        Cart.belongsTo(models.User, { foreignKey: { allowNull: false } })
        Cart.belongsToMany(models.FloorBox, {
            through: models.CartFloorBox,
            foreignKey: "CartId"
        })
        Cart.hasMany(models.CartFloorItem)
    }
    
    return Cart;
};