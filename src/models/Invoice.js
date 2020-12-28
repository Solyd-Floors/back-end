"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { }
    let Invoice = sequelize.define('Invoice', {
        check_id: {
            type: DataTypes.STRING,
            unique: true,
        },
        last_four_digits: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("PENDING","COMPLETED","DECLINED"),
            allowNull: false,
            defaultValue: "PENDING"
        },
        description: {
            type: DataTypes.STRING
        },
        receipt_url: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, options);

    Invoice.associate = models => {
        Invoice.hasMany(models.User)
    }
    
    return Invoice;
};