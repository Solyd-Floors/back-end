"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Business = sequelize.define('Business', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, options);

    Business.associate = models => {
        Business.belongsTo(models.User)
        Business.hasMany(models.Employee)
        Business.belongsTo(models.Industry, { foreignKey: { allowNull: false } })
    }
    
    return Business;
};