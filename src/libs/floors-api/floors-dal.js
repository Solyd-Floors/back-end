
const { Floor,FloorReviewCache, FloorType, FloorCategory, User, Color, Review } = require("../../models");
const { Op } = require("sequelize");
const { getFloorBoxesInfo, findCheapestFloorBoxFor } = require("../floor-boxes-dal");
const { 
    findCheapestFloorBoxPriceFor: wooFindCheapestFloorBoxPriceFor,
    getFloorBoxesInfo: wooGetFloorBoxesInfo
} = require("../woocommerce");

module.exports = {
    findReviewsForFloor: async FloorId => {
        let reviews = await Review.findAll({ where: { woo_product_id: FloorId } });
        reviews = JSON.parse(JSON.stringify(reviews));
        let ops = []
        for (let review of reviews){
            let _ = async () => {
                review.User = await User.findByPk(review.UserId)
            }
            ops.push(
                _()
            )
        }
        await Promise.all(ops);
        return reviews;
    },
    findOne: async ({floor_id, UserId, ...stock_info_args}) => {
        let floor = await Floor.wooFindByPkOr404(floor_id,{ 
            include: [ FloorType, FloorCategory, Color ] 
        })
        // Insert User property into Floor
        floor = JSON.parse(JSON.stringify(floor))
        console.log("stock_info_args",stock_info_args)
        if (Object.keys(stock_info_args).length == 2) {
            console.log(stock_info_args)
            floor.stock_info = await wooGetFloorBoxesInfo({ 
                FloorId: floor_id, UserId,
                ...stock_info_args
            }) 
        }
        let cheapest_floor_box_price = await wooFindCheapestFloorBoxPriceFor({ floor })
        floor.price_per_square_foot = cheapest_floor_box_price
        let floor_review_cache = await FloorReviewCache.findOne({ where: { woo_product_id: floor.id }});
        floor.cached_avg_rating = floor_review_cache ? floor_review_cache.average_rating : 0;

        // mil_type, FloorId, limit, exclude_ids
        // floor.User = await User.findByPkOr404(floor.UserId)
        return floor;
    },
    findAll: async (options = {}) => {
        let where = {}
        let relations = ["ColorId", "FloorCategoryId", "FloorTypeId"]
        relations.map(field_name => options[field_name] ? where[field_name] = Number(options[field_name]) : null)
        if (options.query) where = { ...where, [Op.or]: [ { "name": { [Op.like]: '%' + options.query + '%' } } ] }
        if (options.min_price !== undefined && options.max_price !== undefined) {
            where.price_per_square_foot = { [Op.between]: [ options.min_price, options.max_price ] }
            console.log(where.price_per_square_foot)
        }
        console.log(where,options)
        let floors = await Floor.wooFindAll({ where })
        floors = JSON.parse(JSON.stringify(floors));
        for (let floor of floors){
            let cheapest_floor_box_price = await wooFindCheapestFloorBoxPriceFor({ floor })
            floor.price_per_square_foot = cheapest_floor_box_price
            let floor_review_cache = await FloorReviewCache.findOne({ where: { woo_product_id: floor.id }});
            floor.cached_avg_rating = floor_review_cache ? floor_review_cache.average_rating : 0;
        }
        return floors
    },
    createFloor: async ({ 
        name, description, thumbnail_url,
        FloorCategoryId, FloorId, ColorId, FloorTypeId,
        UserId,plank_dimension_width,plank_dimension_height
     }) => {
         let floor = await Floor.create({ 
            name, description, thumbnail_url,
            FloorCategoryId, plank_dimension_width, plank_dimension_height,
            FloorId, ColorId, UserId, FloorTypeId
         })
         return floor
     },
     updateFloor: async ({pk,data}) => {
        let keys = Object.keys(data);
        let floor = await Floor.findByPkOr404(pk);
        for (let key of keys){
            floor[key] = data[key]
        }
        await floor.save();
        return floor
    },
    deleteFloor: async (pk) => await (await (await Floor.findByPkOr404(pk))).destroy()
}