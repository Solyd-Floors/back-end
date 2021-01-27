
const { ShipToAddress, Order, User, Cart, Invoice, CartFloorItem } = require("../../models")
const { ErrorHandler } = require("../../utils/error")

const findOneShipToAddressOr404 = async ({ pk, BusinessId }) => {
    let ship_to_address = await ShipToAddress.findOne({ where: {
        id: pk, BusinessId, deleted: false
    }})
    if (!ship_to_address) throw new ErrorHandler(404, "Not found", "Ship to address not found")
    return ship_to_address;
}

module.exports = {
    findOneShipToAddressOr404,
    findShipToAddressByBusinessId: async BusinessId => await ShipToAddress.findAll({
        where: { BusinessId, deleted: false }
    }),
    createShipToAddress: async ({ BusinessId, address }) => {
        let ship_to_address = await ShipToAddress.scope("all").findOne({
            where: { BusinessId, address }
        })
        console.log({ship_to_address})
        if (ship_to_address) {
            if (ship_to_address.deleted){
                ship_to_address.deleted = false;
                await ship_to_address.save();
                return ship_to_address
            } else throw new ErrorHandler(403,"UniqueValidationError", [
                "requestBody.address must be unique"
            ])
        }
        return await ShipToAddress.create({
            BusinessId, address
        })
    },
    deleteShipToAddress: async ({ pk, BusinessId }) => {
        let ship_to_address = await findOneShipToAddressOr404({ pk, BusinessId })
        ship_to_address.deleted = true;
        console.log({ship_to_address})
        await ship_to_address.save();
        console.log({ship_to_address})
        return ship_to_address
    },
    findBusinessOrders: async UserId => {
        let orders = await Order.findAll({
            where: { UserId }
        })
        orders = JSON.parse(JSON.stringify(orders));
        for (let order of orders){
            order.User = await User.findOne({ where: { id: order.UserId }})
            order.Invoice = await Invoice.findOne({ where: { id: order.InvoiceId }})
            order.Cart = await Cart.findOne({ where: { id: order.CartId }})
            order.CartFloorItems = await CartFloorItem.findAll({ 
                where: { CartId: order.CartId }
            })
            order.quantity = 0;
            order.CartFloorItems.map(x => order.quantity += x.boxes_amount)
        }
        return JSON.parse(JSON.stringify(orders))
    }
}