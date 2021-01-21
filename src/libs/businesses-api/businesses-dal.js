
const { Business } = require("../../models");

module.exports = {
    findAll: async () => await Business.findAll(),
    createBusiness: async ({ 
        name, address, phone_number,
        UserId, IndustryId 
    }) => await Business.create({ 
        name, address, phone_number,
        UserId, IndustryId 
    }),
    updateBusiness: async ({pk,data}) => {
        let keys = Object.keys(data);
        let business = await Business.findByPkOr404(pk);
        for (let key of keys){
            business[key] = data[key]
        }
        await business.save();
        return business;
    },
    deleteBusiness: async (pk) => await (await (await Business.findByPkOr404(pk))).destroy()
}