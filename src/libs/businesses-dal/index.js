const { Business, User, Industry } = require("../../models");
const { findIndustryByPk } = require("../industries-dal");
const { findUserByPk } = require("../users-dal");

const insertRelationsToBusiness = async business => {
    business = JSON.parse(JSON.stringify(business));
    business.User = await findUserByPk(business.UserId)
    business.Industry = await findIndustryByPk(business.IndustryId)
    return JSON.parse(JSON.stringify(business))
}

module.exports = {
    findByUserPk: async UserId => {
        let business = await Business.findOne({ 
            where: { UserId }
        })
        console.log({business, UserId})
        if (!business) return;
        return await insertRelationsToBusiness(business)
    },
    findByPk: async pk => {
        let business = await Business.findByPkOr404(pk);
        return await insertRelationsToBusiness(business)
    },
}