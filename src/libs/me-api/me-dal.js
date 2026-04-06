const { getFloorBoxesInfo } = require("../floor-boxes-dal");
const { ErrorHandler } = require("../../utils/error");
const models = require("../../models");
const {
    Floor,
    FloorBox,
    Invoice,
    Order,
    CartFloorItem
} = models;
const { findOne: findOneCartFloorItem, removeBoxesFromCartFloorItem, deleteCartFloorItem } = require("../cart-floor-items-dal");
const { createCartFloorItem, findAllForCart: findAllForCartCartFloorItems } = require("../cart-floor-items-dal");
const { getUserActiveCart } = require("../me-dal");
const { findOne: findOneCart } = require("../carts-dal");
const { findByPk: findUserByPk } = require("../users-api/users-dal");
const { chargeCustomer } = require("../stripe");
const uuid = require("uuid");
const { attachFloorCompatibility, buildWooLineItem, toCurrencyNumber } = require("../frontend-compat");

const getCartFloorItemsWithFloor = async ({ CartId }) => await CartFloorItem.findAll({
    where: { CartId },
    include: [ Floor ],
    order: [
        [ "id", "ASC" ]
    ]
});

const formatLineItem = cartFloorItem => ({
    id: cartFloorItem.id,
    product_id: cartFloorItem.FloorId,
    quantity: cartFloorItem.boxes_amount,
    name: cartFloorItem.Floor ? cartFloorItem.Floor.name : undefined
});

const getOrderDetails = async order => {
    const parsedOrder = JSON.parse(JSON.stringify(order));
    parsedOrder.Invoice = parsedOrder.Invoice || await Invoice.findByPk(order.InvoiceId);
    parsedOrder.Cart = await findOneCart({ id: order.CartId });
    parsedOrder.CartFloorItems = JSON.parse(JSON.stringify(await getCartFloorItemsWithFloor({
        CartId: order.CartId
    })));
    parsedOrder.CartFloorItems = await Promise.all(parsedOrder.CartFloorItems.map(async cartFloorItem => ({
        ...cartFloorItem,
        price_per_square_foot: toCurrencyNumber((await FloorBox.unscoped().findOne({
            where: { CartFloorItemId: cartFloorItem.id },
            order: [
                [ "price_per_square_foot", "ASC" ],
                [ "id", "ASC" ]
            ]
        }))?.price_per_square_foot || 0),
        total_price: toCurrencyNumber((await FloorBox.unscoped().findAll({
            where: { CartFloorItemId: cartFloorItem.id }
        })).reduce((sum, floorBox) => (
            sum + (Number(floorBox.price_per_square_foot) * 23.4)
        ), 0)),
        Floor: attachFloorCompatibility({ floor: cartFloorItem.Floor })
    })));
    parsedOrder.quantity = 0;
    parsedOrder.products = [];
    parsedOrder.CartFloorItems.forEach(cartFloorItem => {
        parsedOrder.quantity += cartFloorItem.boxes_amount;
        parsedOrder.products.push(
            `${cartFloorItem.Floor ? cartFloorItem.Floor.name : `Floor #${cartFloorItem.FloorId}`} - ${cartFloorItem.boxes_amount * 23.4}sqft`
        );
    });
    return parsedOrder;
};

const getTotalPrice = async ({ cartFloorItems }) => {
    let price = 0;
    for (let cartFloorItem of cartFloorItems) {
        const floorBox = await FloorBox.findOne({
            where: {
                FloorId: cartFloorItem.FloorId,
                mil_type: cartFloorItem.mil_type,
                status: "ACTIVE"
            },
            order: [
                [ "price_per_square_foot", "ASC" ]
            ]
        });
        if (!floorBox) return 0;
        price += Number(floorBox.price_per_square_foot) * 23.4 * cartFloorItem.boxes_amount;
    }
    return price;
};

const getCartItemsStock = async ({ cartFloorItems }) => {
    const stockChecks = [];
    for (let cartFloorItem of cartFloorItems) {
        const availableBoxes = await FloorBox.count({
            where: {
                FloorId: cartFloorItem.FloorId,
                mil_type: cartFloorItem.mil_type,
                status: "ACTIVE"
            }
        });
        stockChecks.push({
            cartFloorItem,
            availableBoxes
        });
    }
    return stockChecks;
};

module.exports = {
    getOrders: async ({ UserId }) => {
        const orders = await Order.findAll({
            where: { UserId },
            include: [ Invoice ],
            order: [
                [ "createdAt", "DESC" ]
            ]
        });
        const lineItemOrders = [];
        for (const order of orders) {
            const detailedOrder = await getOrderDetails(order);
            detailedOrder.CartFloorItems.forEach(cartFloorItem => {
                const line_item = buildWooLineItem({
                    cartFloorItem,
                    product: cartFloorItem.Floor
                });

                lineItemOrders.push({
                    id: detailedOrder.id,
                    receipt_url: detailedOrder.Invoice ? detailedOrder.Invoice.receipt_url : null,
                    date_paid: detailedOrder.Invoice ? detailedOrder.Invoice.createdAt : detailedOrder.createdAt,
                    total: detailedOrder.Invoice ? detailedOrder.Invoice.price : 0,
                    status: detailedOrder.status,
                    line_item,
                    product: cartFloorItem.Floor
                });
            });
        }
        return lineItemOrders;
    },
    getInvoices: async ({ UserId }) => {
        const orders = await Order.findAll({
            where: { UserId },
            include: [ Invoice ],
            order: [
                [ "createdAt", "DESC" ]
            ]
        });
        return await Promise.all(orders.map(async order => {
            const detailedOrder = await getOrderDetails(order);
            return {
                id: detailedOrder.id,
                receipt_url: detailedOrder.Invoice ? detailedOrder.Invoice.receipt_url : null,
                date_paid: detailedOrder.Invoice ? detailedOrder.Invoice.createdAt : detailedOrder.createdAt,
                total: detailedOrder.Invoice ? detailedOrder.Invoice.price : 0,
                products: detailedOrder.products,
                status: detailedOrder.status
            };
        }));
    },
    discardCart: async UserId => {
        const cart = await getUserActiveCart({ UserId, not_json: true });
        cart.status = "DISCARDED";
        await cart.save();
        return cart;
    },
    addBoxesToCart2: async ({
        UserId, mil_type, boxes_amount, FloorId
    }) => {
        const cart = await getUserActiveCart({ UserId });
        const { id: CartId } = cart;

        const stockInfo = await getFloorBoxesInfo({
            mil_type, FloorId, limit: boxes_amount, cart
        });

        if (stockInfo.boxes < boxes_amount) {
            throw new ErrorHandler(403, "No stock available", stockInfo);
        }

        let cartFloorItem = await findOneCartFloorItem({
            CartId, mil_type, FloorId
        });
        if (!cartFloorItem) {
            cartFloorItem = await createCartFloorItem({
                CartId, mil_type, boxes_amount, FloorId
            });
        } else {
            cartFloorItem.boxes_amount += boxes_amount;
            await cartFloorItem.save();
        }
        return cartFloorItem;
    },
    addBoxesToCart3: async ({
        UserId, mil_type, boxes_amount, FloorId
    }) => {
        await module.exports.addBoxesToCart2({
            UserId,
            mil_type,
            boxes_amount,
            FloorId
        });
        return await getUserActiveCart({ UserId });
    },
    getMyCartFloorItemsInfo: async ({ UserId }) => {
        const { id: CartId } = await getUserActiveCart({ UserId });
        const cartFloorItems = await findAllForCartCartFloorItems({ CartId });
        return await Promise.all(cartFloorItems.map(async cartFloorItem => {
            cartFloorItem = JSON.parse(JSON.stringify(cartFloorItem));
            const { FloorId, mil_type, boxes_amount } = cartFloorItem;
            const stockInfo = await getFloorBoxesInfo({
                mil_type,
                FloorId,
                limit: boxes_amount
            });
            cartFloorItem.in_stock = stockInfo.boxes >= boxes_amount;
            if (!cartFloorItem.in_stock) cartFloorItem.stock_info = stockInfo;
            return cartFloorItem;
        }));
    },
    removeBoxesFromCart: async ({
        UserId, mil_type, boxes_amount, FloorId
    }) => {
        const cart = await getUserActiveCart({ UserId });
        const info = await removeBoxesFromCartFloorItem({
            UserId,
            CartId: cart.id,
            mil_type,
            boxes_amount,
            FloorId,
            cart
        });
        if (info === false) throw new ErrorHandler(403, "No item of this type to be managed.");
        return info;
    },
    removeItemFromCart: async ({
        UserId, line_item_id
    }) => {
        const cart = await getUserActiveCart({ UserId });
        await deleteCartFloorItem({
            CartId: cart.id,
            CartFloorItemId: line_item_id
        });
        return await getUserActiveCart({ UserId });
    },
    checkoutMyCart: async ({ UserId }) => {
        const cart = await getUserActiveCart({ UserId, not_json: true });
        const user = await findUserByPk(UserId);

        if (user.isGuest) {
            throw new ErrorHandler(403, "ValidationError", [
                "Checkout functionality not allowed for guest users."
            ]);
        }

        const cartFloorItems = await getCartFloorItemsWithFloor({ CartId: cart.id });
        if (!cartFloorItems.length) {
            throw new ErrorHandler(403, "EmptyCart", [
                "No items in cart to procceed with checkout."
            ]);
        }

        const stockChecks = await getCartItemsStock({ cartFloorItems });
        const unavailableItem = stockChecks.find(({ cartFloorItem, availableBoxes }) => availableBoxes < cartFloorItem.boxes_amount);
        if (unavailableItem) {
            throw new ErrorHandler(403, "Not in stock", [
                "Some items are not available anymore"
            ]);
        }

        const totalPrice = await getTotalPrice({ cartFloorItems });

        let charge;
        try {
            charge = await chargeCustomer({
                order_id: cart.id,
                customer_id: user.customer_id,
                amount: totalPrice * 100
            });
        } catch (err) {
            if (err.code === "missing") {
                throw new ErrorHandler(err.statusCode, err.type, [
                    "Please add a card."
                ]);
            }
            throw new ErrorHandler(err.statusCode, err.type, [
                err.raw.message
            ]);
        }

        const transaction = await models.sequelize.transaction();

        try {
            const invoice = await Invoice.create({
                check_id: charge.id || uuid.v4(),
                last_four_digits: charge.payment_method_details && charge.payment_method_details.card
                    ? charge.payment_method_details.card.last4
                    : (charge.source && charge.source.last4) || "0000",
                price: totalPrice,
                receipt_url: charge.receipt_url || "",
                status: "COMPLETED",
                UserId
            }, { transaction });

            const order = await Order.create({
                UserId,
                CartId: cart.id,
                InvoiceId: invoice.id
            }, { transaction });

            for (const cartFloorItem of cartFloorItems) {
                const floorBoxes = await FloorBox.findAll({
                    where: {
                        FloorId: cartFloorItem.FloorId,
                        mil_type: cartFloorItem.mil_type,
                        status: "ACTIVE",
                        CartFloorItemId: null
                    },
                    limit: cartFloorItem.boxes_amount,
                    order: [
                        [ "id", "ASC" ]
                    ],
                    transaction
                });

                if (floorBoxes.length < cartFloorItem.boxes_amount) {
                    throw new ErrorHandler(403, "Not in stock", [
                        "Some items are not available anymore"
                    ]);
                }

                await FloorBox.update({
                    status: "PURCHASED",
                    CartFloorItemId: cartFloorItem.id
                }, {
                    where: {
                        id: floorBoxes.map(floorBox => floorBox.id)
                    },
                    transaction
                });
            }

            cart.status = "COMPLETED";
            await cart.save({ transaction });

            await transaction.commit();

            return await module.exports.findOrder({
                UserId,
                OrderId: order.id
            });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
    findOrder: async ({
        UserId, OrderId
    }) => {
        const order = await Order.findOne({
            where: {
                id: OrderId,
                UserId
            },
            include: [ Invoice ]
        });
        if (!order) throw new ErrorHandler(404, "Order not found", [ "Order not found" ]);
        return await getOrderDetails(order);
    },
    cancelOrder: async ({
        UserId, OrderId
    }) => {
        const order = await Order.findOne({
            where: {
                id: OrderId,
                UserId
            },
            include: [ Invoice ]
        });
        if (!order) throw new ErrorHandler(404, "Order not found", [
            "Order not found"
        ]);
        order.status = "CANCELED";
        await order.save();
        return await getOrderDetails(order);
    }
}
