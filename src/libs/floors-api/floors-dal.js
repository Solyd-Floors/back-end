const { Op } = require("sequelize");
const { Floor, FloorReviewCache, FloorType, FloorCategory, User, Color, Review, FloorBox } = require("../../models");
const { getFloorBoxesInfo } = require("../floor-boxes-dal");

const buildInclude = ({ FloorTypeSlug, Color: ColorName } = {}) => {
    const include = [
        {
            model: FloorType,
            required: Boolean(FloorTypeSlug),
            where: FloorTypeSlug ? { name: FloorTypeSlug } : undefined
        },
        {
            model: FloorCategory
        },
        {
            model: Color,
            required: Boolean(ColorName),
            where: ColorName ? {
                [Op.or]: [
                    { name: ColorName },
                    { color: ColorName }
                ]
            } : undefined
        },
        {
            model: User
        }
    ];
    return include;
};

const findCheapestFloorBoxPriceFor = async ({ floorId }) => {
    const floorBox = await FloorBox.findOne({
        where: {
            FloorId: floorId,
            status: "ACTIVE"
        },
        order: [
            [ "price_per_square_foot", "ASC" ]
        ]
    });
    return floorBox ? Number(floorBox.price_per_square_foot) : null;
};

const attachComputedFields = async ({ floor, UserId, stockInfoArgs = {} }) => {
    floor = JSON.parse(JSON.stringify(floor));

    if (Object.keys(stockInfoArgs).length === 2) {
        floor.stock_info = await getFloorBoxesInfo({
            FloorId: floor.id,
            UserId,
            ...stockInfoArgs
        });
    }

    floor.price_per_square_foot = await findCheapestFloorBoxPriceFor({ floorId: floor.id });

    const floorReviewCache = await FloorReviewCache.findOne({
        where: { woo_product_id: floor.id }
    });
    floor.cached_avg_rating = floorReviewCache ? floorReviewCache.average_rating : 0;

    return floor;
};

module.exports = {
    findReviewsForFloor: async FloorId => {
        const reviews = await Review.findAll({ where: { woo_product_id: FloorId } });
        const parsedReviews = JSON.parse(JSON.stringify(reviews));
        await Promise.all(parsedReviews.map(async review => {
            review.User = await User.findByPk(review.UserId);
        }));
        return parsedReviews;
    },
    findOne: async ({ floor_id, UserId, ...stockInfoArgs }) => {
        const floor = await Floor.findByPkOr404(
            floor_id,
            { include: buildInclude() }
        );
        return await attachComputedFields({ floor, UserId, stockInfoArgs });
    },
    findAll: async (options = {}) => {
        const where = {};

        [ "ColorId", "FloorCategoryId", "FloorTypeId" ].forEach(fieldName => {
            if (options[fieldName]) where[fieldName] = Number(options[fieldName]);
        });

        if (options.query) {
            where.name = { [Op.like]: `%${options.query}%` };
        }

        const floors = await Floor.findAll({
            where,
            include: buildInclude(options),
            order: [
                [ "id", "ASC" ]
            ]
        });

        return await Promise.all(
            floors.map(floor => attachComputedFields({ floor }))
        );
    },
    createFloor: async ({
        name, description, thumbnail_url,
        FloorCategoryId, ColorId, FloorTypeId,
        UserId, plank_dimension_width, plank_dimension_height
     }) => {
         return await Floor.create({
            name,
            description,
            thumbnail_url,
            FloorCategoryId,
            ColorId,
            FloorTypeId,
            UserId,
            plank_dimension_width,
            plank_dimension_height
         });
     },
     updateFloor: async ({ pk, data }) => {
        return await Floor.customUpdate({ pk, data });
    },
    deleteFloor: async pk => await (await Floor.findByPkOr404(pk)).destroy()
}
