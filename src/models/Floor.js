"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Floor = sequelize.define('Floor', {
        profile_picture_url: {
            type: DataTypes.STRING,
        },
        price: {
            type: DataTypes.INTEGER
        },
        quantity: {
            type: DataTypes.INTEGER
        }
    }, options);

    Floor.associate = models => {
        Floor.hasOne(models.FloorCategory)
        Floor.hasOne(models.FloorType)
        Floor.hasOne(models.Brand)
        Floor.hasOne(models.User)
    }
    
    return Floor;
};