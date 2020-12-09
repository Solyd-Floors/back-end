
const { Floor } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
    findAll: async (options = {}) => {
        let where = {}
        let relations = ["FloorCategoryId", "BrandId", "FloorTypeId"]
        relations.map(field_name => options[field_name] ? where[field_name] = Number(options[field_name]) : null)
        if (options.query) where = { ...where, [Op.or]: [ { "name": { [Op.like]: '%' + options.query + '%' } } ] }
        if (options.min_price !== undefined && options.max_price !== undefined) {
            where.price = { [Op.between]: [ options.min_price, options.max_price ] }
            console.log(where.price)
        }
        console.log(where,options)
        return await Floor.findAll({ where })
    },
    createFloor: async ({ 
        name, thumbnail_url, price, quantity, 
        FloorCategoryId, FloorId, FloorTypeId,
        BrandId, UserId,
     }) => await Floor.create({ 
        name, thumbnail_url, price,
        quantity, FloorCategoryId, 
        FloorId, BrandId, UserId, FloorTypeId
     }),
     updateFloor: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor = await Floor.findByPkOr404(pk);
        for (let key of keys){
            floor[key] = data[key]
        }
        await floor.save();
        return floor;
    },
    deleteFloor: async (pk) => await (await (await Floor.findByPkOr404(pk))).destroy()
}