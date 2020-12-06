"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Floor = sequelize.define('Floor', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumbnail_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, options);

    Floor.associate = models => {
        Floor.belongsTo(models.FloorCategory, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.FloorType, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.Brand, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.User, { foreignKey: { allowNull: false } })
    }
    
    return Floor;
};