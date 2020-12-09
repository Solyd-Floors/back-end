"use strict"

const { ErrorHandler } = require("../utils/error");
const { Installer } = require("./installer");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let TeamMember = sequelize.define('TeamMember', {
        full_name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, options);

    return TeamMember;
};