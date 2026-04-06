const BOX_COVERAGE_SQFT = 23.4;
const DEFAULT_FLOOR_IMAGE = "https://solyd-floors.vercel.app/product-placeholder-300x300.png";

const ensureArray = value => Array.isArray(value) ? value : [];

const toNumber = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toCurrencyNumber = value => Number(toNumber(value).toFixed(2));

const getVariationMilType = variation => {
    if (variation && variation.mil_type !== undefined) {
        const parsedMilType = Number(variation.mil_type);
        if (Number.isFinite(parsedMilType)) return parsedMilType;
    }

    const firstAttribute = ensureArray(variation && variation.attributes)[0];
    const option = firstAttribute && firstAttribute.option;
    const parsedOption = Number(String(option || "").split(" ")[0]);
    return Number.isFinite(parsedOption) ? parsedOption : undefined;
};

const getFloorThumbnail = floor => {
    if (floor && floor.thumbnail_url) return floor.thumbnail_url;

    const firstImage = ensureArray(floor && floor.images)[0];
    return (
        (firstImage && (firstImage.src || firstImage.guid || firstImage.image_url)) ||
        DEFAULT_FLOOR_IMAGE
    );
};

const normalizeImage = (image, index, fallbackSrc) => {
    const src = image && (image.src || image.guid || image.image_url || image.thumbnail_url) || fallbackSrc;
    if (!src) return null;

    return {
        ...(image || {}),
        id: image && image.id ? image.id : index + 1,
        src
    };
};

const buildFloorImages = floor => {
    const thumbnail = getFloorThumbnail(floor);
    const normalizedImages = ensureArray(floor && floor.images)
        .map((image, index) => normalizeImage(image, index, thumbnail))
        .filter(Boolean);

    if (normalizedImages.length) return normalizedImages;

    return [
        {
            id: floor && floor.id ? floor.id : 1,
            src: thumbnail
        }
    ];
};

const buildPlankDimensions = floor => {
    if (floor && floor.plank_dimensions) return floor.plank_dimensions;

    const width = floor && floor.plank_dimension_width;
    const height = floor && floor.plank_dimension_height;
    if (!width || !height) return undefined;

    return `${width}"x${height}"`;
};

const mergeAttributes = ({ existingAttributes, computedAttributes }) => {
    const mergedAttributes = new Map();

    ensureArray(existingAttributes)
        .filter(attribute => attribute && attribute.name)
        .forEach(attribute => mergedAttributes.set(attribute.name, attribute));

    ensureArray(computedAttributes)
        .filter(attribute => attribute && attribute.name)
        .forEach(attribute => {
            const currentAttribute = mergedAttributes.get(attribute.name);
            if (!currentAttribute) {
                mergedAttributes.set(attribute.name, attribute);
                return;
            }

            mergedAttributes.set(attribute.name, {
                ...currentAttribute,
                options: Array.from(new Set([
                    ...ensureArray(currentAttribute.options),
                    ...ensureArray(attribute.options)
                ]))
            });
        });

    return Array.from(mergedAttributes.values());
};

const buildInventoryBuckets = floorBoxes => {
    const buckets = new Map();

    ensureArray(floorBoxes).forEach(floorBox => {
        const milType = toNumber(floorBox && floorBox.mil_type);
        if (!milType) return;

        const currentBucket = buckets.get(milType) || {
            id: floorBox.id,
            mil_type: milType,
            stock_quantity: 0,
            price_per_square_foot: toNumber(floorBox.price_per_square_foot)
        };

        currentBucket.stock_quantity += 1;

        const currentPrice = toNumber(floorBox.price_per_square_foot);
        if (!currentBucket.price_per_square_foot || currentPrice < currentBucket.price_per_square_foot) {
            currentBucket.price_per_square_foot = currentPrice;
            currentBucket.id = floorBox.id;
        }

        buckets.set(milType, currentBucket);
    });

    return Array.from(buckets.values()).sort((left, right) => left.mil_type - right.mil_type);
};

const buildFrontendVariations = ({ floor, inventoryBuckets }) => {
    const existingVariations = ensureArray(floor && floor.Variations);

    if (existingVariations.length) {
        return existingVariations.map((variation, index) => {
            const milType = getVariationMilType(variation);

            return {
                ...(variation || {}),
                id: variation && variation.id ? variation.id : index + 1,
                stock_quantity: toNumber(variation && variation.stock_quantity),
                images: buildFloorImages({
                    thumbnail_url: getFloorThumbnail(floor),
                    images: variation && variation.images
                }),
                attributes: ensureArray(variation && variation.attributes).length
                    ? variation.attributes
                    : milType
                        ? [{ id: `wear-layer-${milType}`, name: "Wear Layer", option: `${milType} mil` }]
                        : []
            };
        });
    }

    return ensureArray(inventoryBuckets).map(bucket => ({
        id: bucket.id,
        stock_quantity: toNumber(bucket.stock_quantity),
        price_per_square_foot: toCurrencyNumber(bucket.price_per_square_foot),
        price: toCurrencyNumber(toNumber(bucket.price_per_square_foot) * BOX_COVERAGE_SQFT),
        regular_price: toCurrencyNumber(toNumber(bucket.price_per_square_foot) * BOX_COVERAGE_SQFT),
        mil_type: bucket.mil_type,
        attributes: [
            {
                id: `wear-layer-${bucket.mil_type}`,
                name: "Wear Layer",
                option: `${bucket.mil_type} mil`
            }
        ],
        images: buildFloorImages(floor)
    }));
};

const attachFloorCompatibility = ({ floor, inventoryBuckets = [] }) => {
    if (!floor) return floor;

    const thumbnail = getFloorThumbnail(floor);
    const images = buildFloorImages({
        ...floor,
        thumbnail_url: thumbnail
    });
    const plankDimensions = buildPlankDimensions(floor);
    const variations = buildFrontendVariations({
        floor: {
            ...floor,
            thumbnail_url: thumbnail,
            images
        },
        inventoryBuckets
    });
    const wearLayerOptions = Array.from(new Set(
        variations
            .map(getVariationMilType)
            .filter(Boolean)
            .map(milType => `${milType} mil`)
    ));

    const computedAttributes = [];
    if (wearLayerOptions.length) {
        computedAttributes.push({
            name: "Wear Layer",
            options: wearLayerOptions
        });
    }
    if (plankDimensions) {
        computedAttributes.push({
            name: "Plank dimensions",
            options: [ plankDimensions ]
        });
    }

    return {
        ...floor,
        thumbnail_url: thumbnail,
        images,
        Variations: variations,
        plank_dimensions: plankDimensions,
        attributes: mergeAttributes({
            existingAttributes: floor.attributes,
            computedAttributes
        })
    };
};

const buildWooLineItem = ({ cartFloorItem, product }) => {
    const quantity = toNumber(cartFloorItem && cartFloorItem.boxes_amount);
    const pricePerSquareFoot = toNumber(cartFloorItem && cartFloorItem.price_per_square_foot);
    const total = toCurrencyNumber(
        cartFloorItem && cartFloorItem.total_price !== undefined
            ? cartFloorItem.total_price
            : (pricePerSquareFoot * BOX_COVERAGE_SQFT) * quantity
    );
    const pricePerBox = toCurrencyNumber(
        pricePerSquareFoot
            ? pricePerSquareFoot * BOX_COVERAGE_SQFT
            : (quantity ? total / quantity : 0)
    );
    const milType = toNumber(cartFloorItem && cartFloorItem.mil_type);

    return {
        id: cartFloorItem.id,
        product_id: cartFloorItem.FloorId,
        variation_id: cartFloorItem.variation_id || null,
        quantity,
        price: pricePerBox,
        total,
        name: product && product.name,
        parent_name: product && product.name,
        product,
        meta_data: [
            {
                id: `wear-layer-${cartFloorItem.id}`,
                key: "Wear Layer",
                display_key: "Wear Layer",
                value: milType,
                display_value: milType ? `${milType} mil` : ""
            }
        ]
    };
};

const attachCartCompatibility = async ({ cart, decorateProduct }) => {
    if (!cart) return cart;

    const cartFloorItems = ensureArray(cart.CartFloorItems);
    const preparedCartFloorItems = await Promise.all(cartFloorItems.map(async cartFloorItem => {
        const product = await Promise.resolve(
            decorateProduct ? decorateProduct(cartFloorItem.Floor, cartFloorItem) : cartFloorItem.Floor
        );

        return {
            ...cartFloorItem,
            Floor: product
        };
    }));

    const lineItems = preparedCartFloorItems.map(cartFloorItem => buildWooLineItem({
        cartFloorItem,
        product: cartFloorItem.Floor
    }));

    const total = toCurrencyNumber(
        lineItems.reduce((sum, lineItem) => sum + toNumber(lineItem.total), 0)
    );

    return {
        ...cart,
        CartFloorItems: preparedCartFloorItems,
        woo_order: {
            id: cart.woo_order_id || cart.id || 0,
            line_items: lineItems,
            total_tax: 0,
            total
        }
    };
};

module.exports = {
    BOX_COVERAGE_SQFT,
    attachCartCompatibility,
    attachFloorCompatibility,
    buildInventoryBuckets,
    buildWooLineItem,
    toCurrencyNumber,
    toNumber
};
