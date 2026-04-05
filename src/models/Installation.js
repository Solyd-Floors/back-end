"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let Installation = sequelize.define('Installation', {
        status: {
            type: DataTypes.ENUM(
                "NOT_STARTED",
                "STARTED",
                "FINISHED"
            ),
            allowNull: false,
            defaultValue: "NOT_STARTED"
        },
    });

    Installation.associate = models => {
        Installation.belongsTo(models.Installer, { foreignKey: { allowNull: false } })
        Installation.belongsTo(models.Order, { foreignKey: { allowNull: false } })
    }
    
    return Installation;
};