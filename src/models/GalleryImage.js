"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let GalleryImage = sequelize.define("GalleryImage", {
        image_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, options);

    GalleryImage.associate = models => {
        GalleryImage.belongsTo(models.Floor)
    }
    
    return GalleryImage;
};
