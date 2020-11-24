"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Brand = sequelize.define('Brand', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, options);

    Brand.associate = models => {
        
    }
    
    return Brand;
};