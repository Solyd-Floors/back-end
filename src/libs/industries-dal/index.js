const { Industry } = require("../../models");

module.exports = {
    findIndustryByPk: async pk => await Industry.findByPkOr404(pk)
}