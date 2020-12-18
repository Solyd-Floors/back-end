"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let FloorCategory = sequelize.define('FloorCategory', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, options);

    FloorCategory.associate = models => {
        FloorCategory.hasMany(models.Floor)
    }
    
    return FloorCategory;
};