"use strict"

const { ErrorHandler } = require("../utils/error");
const { Installer } = require("./installer");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            attributes: { exclude: [ "password" ] },
            include: [{ all: true }]
        },
        scopes: {
            withPassword: {
                attributes: {},
            },
        }
    }
    let User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
    }, options);
    User.associate = models => {
        User.hasOne(models.Installer)
    }
    
    return User;
};