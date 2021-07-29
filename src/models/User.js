"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            attributes: { exclude: [ "password", "forget_password_token" ] },
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
            withForgetPasswordToken: {
                attributes: {}
            }
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
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        picture_url: {
            type: DataTypes.TEXT,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        customer_id: { 
            type: DataTypes.STRING
        },
        woo_customer_id: {
            type: DataTypes.INTEGER,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        forget_password_token: {
            type: DataTypes.STRING
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