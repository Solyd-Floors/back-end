"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let CartChangeLog = sequelize.define('CartChangeLog', {
        type: {
            type: DataTypes.ENUM(
                "ADDED_BOX","REMOVED_BOX","ADDED_SOLYD_INSTALLATION",
                "REMOVED_SOLYD_INSTALLATION", "DISCARDED", "PURCHASED",
                "FAILED_ATTEMPT_TO_PURCHASE"
            ),
            allowNull: false,
        },
    });

    CartChangeLog.associate = models => {
        CartChangeLog.belongsTo(models.Cart, { foreignKey: { allowNull: false } })
        CartChangeLog.belongsTo(models.FloorBox)
    }
    
    return CartChangeLog;
};