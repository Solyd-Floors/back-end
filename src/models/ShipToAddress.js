"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            where: { 
                deleted: false
            }
        },
        scopes: {
            all: {
                where: { }
            }
        }
    }
    let ShipToAddress = sequelize.define('ShipToAddress', {
        address: {
            type: DataTypes.STRING,
            unique: true
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, options);

    ShipToAddress.associate = models => {
        ShipToAddress.belongsTo(models.Business);
    }
    
    return ShipToAddress;
};