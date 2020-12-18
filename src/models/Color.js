"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Color = sequelize.define('Color', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        color: {
            type: DataTypes.STRING,
            unique: true
        }
    }, options);

    Color.associate = models => {
        Color.hasMany(models.Floor)
    }
    
    return Color;
};