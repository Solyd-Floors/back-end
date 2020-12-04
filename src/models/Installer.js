"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Installer = sequelize.define('Installer', {
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        job_status: {
            type: DataTypes.ENUM("EMPLOYED","UNEMPLOYED"),
            allowNull: false
        },
        hourly_rate: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PENDING","APPROVED","DENIED"),
            allowNull: false
        },
        profile_picture_url: {
            type: DataTypes.TEXT
        }    
    }, options);

    Installer.associate = models => {
        Installer.belongsTo(models.Country);
        Installer.belongsTo(models.User);
    }
    
    return Installer;
};