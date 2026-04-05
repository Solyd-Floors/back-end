"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            order: [
                [ "createdAt", "DESC" ]
            ]
        }
    }
    let FloorReviewCache = sequelize.define('FloorReviewCache', {
        total_reviews_num: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        average_rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0,
                max: 10
            },
            allowNull: false
        },
        woo_product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, options);
    
    return FloorReviewCache;
};
