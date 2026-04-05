
const { Color } = require("../../models");

module.exports = {
    findAll: async () => await Color.findAll(),
    createColor: async ({ name, color }) => await Color.create({ name, color }),
    updateColor: async ({pk,data}) => {
        let keys = Object.keys(data);
        let color = await Color.findByPkOr404(pk);
        for (let key of keys){
            color[key] = data[key]
        }
        await color.save();
        return color;
    },
    deleteColor: async (pk) => await (await (await Color.findByPkOr404(pk))).destroy()
}