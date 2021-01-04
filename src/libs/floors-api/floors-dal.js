
const { Floor, FloorType, FloorCategory, Brand, User, Color } = require("../../models");
const { Op } = require("sequelize");
const { getFloorWithFloorTileSizes, updateFloorTileSizes } = require("../floor-floor-tile-sizes-dal");
const { getFloorBoxesInfo } = require("../floor-boxes-dal");

module.exports = {
    findOne: async ({floor_id, UserId, ...stock_info_args}) => {
        let floor = await Floor.findByPkOr404(floor_id,{ 
            include: [ FloorType, FloorCategory, Brand, Color ] 
        })
        floor = await getFloorWithFloorTileSizes({ floor });
        // Insert User property into Floor
        floor = JSON.parse(JSON.stringify(floor))
        if (Object.keys(stock_info_args).length == 3) {
            floor.stock_info = await getFloorBoxesInfo({ 
                FloorId: floor.id, UserId,
                ...stock_info_args
            }) 
        }
        // mil_type, FloorId, FloorTileSizeId, limit, exclude_ids
        floor.User = await User.findByPkOr404(floor.UserId)
        return floor;
    },
    findAll: async (options = {}) => {
        let where = {}
        let relations = ["ColorId", "FloorCategoryId", "BrandId", "FloorTypeId"]
        relations.map(field_name => options[field_name] ? where[field_name] = Number(options[field_name]) : null)
        if (options.query) where = { ...where, [Op.or]: [ { "name": { [Op.like]: '%' + options.query + '%' } } ] }
        if (options.min_price !== undefined && options.max_price !== undefined) {
            where.price = { [Op.between]: [ options.min_price, options.max_price ] }
            console.log(where.price)
        }
        console.log(where,options)
        let floors = await Floor.findAll({ where })
        let ops = []
        for (let floor of floors) {
            ops.push(getFloorWithFloorTileSizes({ floor }))
        }
        return await Promise.all(ops);
    },
    createFloor: async ({ 
        name, description, thumbnail_url,
        FloorCategoryId, FloorId, ColorId, FloorTypeId,
        BrandId, UserId, floor_tile_sizes
     }) => {
         let floor = await Floor.create({ 
            name, description, thumbnail_url,
            FloorCategoryId, 
            FloorId, ColorId, BrandId, UserId, FloorTypeId
         })
         await updateFloorTileSizes({ floor,floor_tile_sizes });
         return await getFloorWithFloorTileSizes({ floor });
 
     },
     updateFloor: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor = await Floor.findByPkOr404(pk);
        for (let key of keys){
            if (key === "floor_tile_sizes"){
                await updateFloorTileSizes({ 
                    floor, 
                    floor_tile_sizes: data["floor_tile_sizes"]
                });
            } else {
                floor[key] = data[key]
            }
        }
        await floor.save();
        return await getFloorWithFloorTileSizes({ floor });
    },
    deleteFloor: async (pk) => await (await (await Floor.findByPkOr404(pk))).destroy()
}