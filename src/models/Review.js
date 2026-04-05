"use strict"

const { updateFloorAverageRating } = require("../libs/floors-dal");
const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            order: [
                [ "createdAt", "DESC" ]
            ]
        }
    }
    let Review = sequelize.define('Review', {
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        value: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 10
            },
            allowNull: false
        },
        woo_product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, options);

    Review.associate = models => {
        Review.belongsTo(models.User)
        // Review.belongsTo(models.Floor, { foreignKey: { allowNull: false }})
    }
    
    return Review;
};