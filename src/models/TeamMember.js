"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let TeamMember = sequelize.define('TeamMember', {
        profile_picture_url: {
            type: DataTypes.STRING,
        },
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