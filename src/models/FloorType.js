"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let FloorType = sequelize.define('FloorType', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, options);

    FloorType.associate = models => {
        FloorType.hasMany(models.Floor)
    }
    
    return FloorType;
};