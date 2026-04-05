"use strict"

module.exports = (sequelize, DataTypes) => {
    let options = {
        defaultScope: { 
        }
    }
    let CartFloorItem = sequelize.define('CartFloorItem', {
        status: {
            type: DataTypes.ENUM("ACTIVE","REMOVED"),
            allowNull: false,
            defaultValue: "ACTIVE"
        },
        mil_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        boxes_amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // total_price: {
        //     type: DataTypes.VIRTUAL,
        //     set: function(val) {
        //         let mil_type = this.get("mil_type")
        //         let FloorId = this.get("FloorId")
        //         let boxes_amount = this.get("boxes_amount")
        //         console.log({mil_type, FloorId, boxes_amount})
        //         let floor_box = FloorBox.findOne({ where: { mil_type, FloorId } })
        //         let price = floor_box.price_per_square_foot * boxes_amount
        //         console.log({price},9999)
        //         return price
        //     }
        // },
        square_feet: {
            type: DataTypes.VIRTUAL,
            set: function(val) {
                return 23.4
            }
        }
    }, options);
    CartFloorItem.associate = models => {
        CartFloorItem.belongsTo(models.Cart, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.Floor, { foreignKey: { allowNull: false, primaryKey: true } })
        CartFloorItem.belongsTo(models.ShipToAddress)
        CartFloorItem.belongsTo(models.Installation)
        CartFloorItem.hasMany(models.FloorBox);
    }
    
    return CartFloorItem;
};
