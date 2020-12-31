
const { CartFloorItem } = require("../../models");

module.exports = {
    findAll: async () => await CartFloorItem.findAll(),
    updateCartFloorItem: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor_type = await CartFloorItem.findByPkOr404(pk);
        for (let key of keys){
            floor_type[key] = data[key]
        }
        await floor_type.save();
        return floor_type;
    },
    deleteCartFloorItem: async (pk) => await (await (await CartFloorItem.findByPkOr404(pk))).destroy()
}