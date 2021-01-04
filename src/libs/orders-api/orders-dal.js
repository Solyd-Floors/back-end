
const { Order } = require("../../models");

module.exports = {
    findAll: async () => await Order.findAll(),
    createOrder: async ({ 
        status, UserId, CartId, InvoiceId, 
        InstallationId, ShipToAddressId
     }) => await Order.create({ 
        status, UserId, CartId, InvoiceId, 
        InstallationId, ShipToAddressId
     }),
    updateOrder: async ({pk,data}) => {
        let keys = Object.keys(data);
        let order = await Order.findByPkOr404(pk);
        for (let key of keys){
            order[key] = data[key]
        }
        await order.save();
        return order;
    },
    deleteOrder: async (pk) => await (await (await Order.findByPkOr404(pk))).destroy()
}