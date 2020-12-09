"use strict"

const { ErrorHandler } = require("../utils/error");
const { Installer } = require("./installer");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Contact = sequelize.define('Contact', {
        full_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, options);

    return Contact;
};