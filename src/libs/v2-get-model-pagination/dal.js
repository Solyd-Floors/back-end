
// const { FloorType } = require("../../models");

module.exports = {
    findAll: async ({ model, limit, offset }) => {
        let result = await model.findAndCountAll({
            limit, offset, order: [ ['id', 'DESC'] ]
        })
        console.log(result)
        return result
    }
}