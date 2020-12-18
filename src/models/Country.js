"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Country = sequelize.define('Country', {
        name: {
            type: DataTypes.STRING,
            unique: true
        }
    }, options);

    Country.associate = models => {
        Country.hasMany(models.Installer)
    }
    
    return Country;
};