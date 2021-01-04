"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            attributes: { exclude: [ "password" ] },
            order: [
                [
                    "isGuest", "ASC"
                ]
            ],
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
        },
        isGuest: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, options);
    User.associate = models => {
        User.hasOne(models.Installer)
        User.hasMany(models.Floor)
        
    }
    
    return User;
};