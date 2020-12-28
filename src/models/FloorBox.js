"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let FloorBox = sequelize.define('FloorBox', {
        SKU: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        mil_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("ACTIVE","PURCHASED")
        }
    });

    FloorBox.associate = models => {
        FloorBox.belongsTo(models.Floor, { foreignKey: { allowNull: false } })
        FloorBox.belongsTo(models.FloorTileSize, { foreignKey: { allowNull: false } })
    }
    
    return FloorBox;
};