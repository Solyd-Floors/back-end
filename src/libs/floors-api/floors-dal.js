const { Op } = require("sequelize");
const { Floor, FloorReviewCache, FloorType, FloorCategory, User, Color, Review, FloorBox } = require("../../models");
const { getFloorBoxesInfo } = require("../floor-boxes-dal");
const { attachFloorCompatibility, buildInventoryBuckets } = require("../frontend-compat");

const PAGE_SIZE = 10;

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
            model: User.unscoped(),
            attributes: { exclude: [ "password", "forget_password_token" ] }
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

const getInventoryBucketsForFloor = async ({ floorId, UserId }) => {
    const floorBoxes = await FloorBox.findAll({
        where: {
            FloorId: floorId,
            status: "ACTIVE",
            CartFloorItemId: null
        },
        order: [
            [ "mil_type", "ASC" ],
            [ "price_per_square_foot", "ASC" ],
            [ "id", "ASC" ]
        ]
    });

    const inventoryBuckets = buildInventoryBuckets(JSON.parse(JSON.stringify(floorBoxes)));
    if (!UserId) return inventoryBuckets;

    return await Promise.all(inventoryBuckets.map(async inventoryBucket => {
        const stockInfo = await getFloorBoxesInfo({
            FloorId: floorId,
            mil_type: inventoryBucket.mil_type,
            UserId
        });

        return {
            ...inventoryBucket,
            stock_quantity: stockInfo.boxes,
            price_per_square_foot: Number(stockInfo.price_per_square_foot || inventoryBucket.price_per_square_foot || 0),
            pallets: stockInfo.pallets,
            square_feet_available: stockInfo.square_feet_available
        };
    }));
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
    floor.cached_total_reviews_len = floorReviewCache ? floorReviewCache.total_reviews_num : 0;

    const inventoryBuckets = await getInventoryBucketsForFloor({
        floorId: floor.id,
        UserId
    });

    return attachFloorCompatibility({
        floor,
        inventoryBuckets
    });
};

const filterFloorsByPrice = ({ floors, min_price, max_price }) => floors.filter(floor => {
    if (min_price !== undefined && floor.price_per_square_foot < Number(min_price)) return false;
    if (max_price !== undefined && floor.price_per_square_foot > Number(max_price)) return false;
    return true;
});

module.exports = {
    PAGE_SIZE,
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
        const requestedPage = Number(options.page);

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

        let preparedFloors = await Promise.all(
            floors.map(floor => attachComputedFields({ floor }))
        );

        preparedFloors = filterFloorsByPrice({
            floors: preparedFloors,
            min_price: options.min_price,
            max_price: options.max_price
        });

        if (options.ignorePagination || !Number.isFinite(requestedPage) || requestedPage <= 0) {
            return preparedFloors;
        }

        const startIndex = (requestedPage - 1) * PAGE_SIZE;
        return preparedFloors.slice(startIndex, startIndex + PAGE_SIZE);
    },
    countAll: async (options = {}) => {
        const floors = await module.exports.findAll({
            ...options,
            ignorePagination: true
        });
        return floors.length;
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
