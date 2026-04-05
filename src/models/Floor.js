"use strict"

module.exports = (sequelize, DataTypes) => {
    let options = {
        // defaultScope: { 
        //     include: { all: true }
        // }
    }
    let Floor = sequelize.define('Floor', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumbnail_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        plank_dimension_width: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        plank_dimension_height: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cached_avg_rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        cached_total_reviews_len: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        __typename: {
            type: DataTypes.VIRTUAL,
            get: function(val){
                return "Floor"
            }
        }
    }, options);
    
    Floor.associate = models => {
        Floor.belongsTo(models.FloorCategory, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.FloorType, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.Color, { foreignKey: { allowNull: false } })
        Floor.belongsTo(models.User, { foreignKey: { allowNull: false } })
    }
    
    return Floor;
};
