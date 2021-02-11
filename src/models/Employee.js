"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = {
        defaultScope: {
            attributes: { exclude: [ "password" ] },
        },
        scopes: {
            withPassword: {
                attributes: {},
            },
        }
    }
    let Employee = sequelize.define('Employee', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
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
        address: {
            type: DataTypes.STRING,
        },
        address2: {
            type: DataTypes.STRING,
        },
        phone_number: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.STRING,
        },
        postcode: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
        },
    }, options);

    Employee.associate = models => {
        Employee.belongsTo(models.Business, { foreignKey: { allowNull: false } });
    }
    
    return Employee;
};