
const { Industry } = require("../../models");

module.exports = {
    findAll: async () => await Industry.findAll(),
    createIndustry: async ({ name }) => await Industry.create({ name }),
    updateIndustry: async ({pk,data}) => {
        let keys = Object.keys(data);
        let industry = await Industry.findByPkOr404(pk);
        for (let key of keys){
            industry[key] = data[key]
        }
        await industry.save();
        return industry;
    },
    deleteIndustry: async (pk) => await (await (await Industry.findByPkOr404(pk))).destroy()
}