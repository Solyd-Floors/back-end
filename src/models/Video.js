"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Video = sequelize.define('Video', {
        youtube_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, options);

    return Video;
};