"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let Employee = sequelize.define('Employee', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Employee.associate = models => {
        Employee.belongsTo(models.Business, { foreignKey: { allowNull: false } });
    }
    
    return Employee;
};