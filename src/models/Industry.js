"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Industry = sequelize.define('Industry', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, options);

    Industry.associate = models => {
        Industry.hasMany(models.Business)
    }
    
    return Industry;
};