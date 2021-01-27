
const { getFloorBoxesInfo } = require("../floor-boxes-dal");
const { ErrorHandler } = require("../../utils/error");
const { findAll: findAllCartFloorBoxes } = require("../cart-floor-boxes-dal");
const { 
    Floor, 
    FloorTileSize, 
    FloorBox, 
    Invoice, 
    Order, 
    Cart, 
    CartFloorItem, 
} = require("../../models");
const { findOne: findOneCartFloorItem, findAllOnCart, removeBoxesFromCartFloorItem, deleteCartFloorItem, findAllForCartWhere } = require("../cart-floor-items-dal");
const { createCartFloorItem, findAllForCart: findAllForCartCartFloorItems } = require("../cart-floor-items-dal");
const { getUserActiveCart } = require("../me-dal");
const uuid = require("uuid");
const { findOne: findOneCart } = require("../carts-dal");

const getMyCartFloorItemsInfo = async ({
    UserId
}) => {
    let { id: CartId } = await getUserActiveCart({ UserId });
    let cart_floor_items = await findAllForCartCartFloorItems({ CartId })
    cart_floor_items = cart_floor_items.map(async cart_floor_item => {
        cart_floor_item = JSON.parse(JSON.stringify(cart_floor_item))
        let { FloorId, FloorTileSizeId, mil_type, boxes_amount } = cart_floor_item
        let stock_info = await getFloorBoxesInfo({
            mil_type, FloorId, FloorTileSizeId, limit: boxes_amount
        })
        let stock_available = stock_info.boxes >= boxes_amount
        if (!stock_available) {
            cart_floor_item = JSON.parse(JSON.stringify(cart_floor_item))
            cart_floor_item.in_stock = false;
            cart_floor_item.stock_info = stock_info;
        } else {
            cart_floor_item.in_stock = true;
        }
        return cart_floor_item
    })
    return Promise.all(cart_floor_items);
}

const getTotalPrice = async ({cart_floor_items}) => {
    let price = 0;
    for (let cart_floor_item of cart_floor_items){
        let { FloorTileSizeId, FloorId, mil_type, boxes_amount } = cart_floor_item;
        let floor_box = await FloorBox.findOne({ where: { 
            FloorTileSizeId, FloorId, mil_type
        }})
        if (!floor_box) return 0
        price += floor_box.price * boxes_amount
    }
    return price;
}

module.exports = {
    discardCart: async UserId => {
        let cart = await getUserActiveCart({ UserId, not_json: true })
        cart.status = "DISCARDED"
        console.log({cart},cart.update, cart.save)
        await cart.save();
        return cart;
    },
    addBoxesToCart2: async ({
        UserId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let { id: CartId } = cart
        // let boxes_already_in_cart = await findAllForCartWhere(cart.id,{
        //     where: {
        //         FloorTileSizeId, FloorId, mil_type
        //     }
        // })
        // let current_boxes_number = 0;
        // boxes_already_in_cart.map(x => (current_boxes_number += x))

        let stock_info = await getFloorBoxesInfo({
            mil_type, FloorId, FloorTileSizeId, limit: boxes_amount, cart
        })

        let stock_available = stock_info.boxes >= boxes_amount //+ current_boxes_number

        if (!stock_available) throw new ErrorHandler(403, "No stock available", stock_info)

        let cart_floor_item = await findOneCartFloorItem({
            CartId, mil_type, FloorTileSizeId, FloorId 
        })
        if (!cart_floor_item) cart_floor_item = await createCartFloorItem({
            CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId
        })
        else {
            cart_floor_item.boxes_amount += boxes_amount
            await cart_floor_item.save()
        }
        return cart_floor_item;
    },
    getMyCartFloorItemsInfo,
    removeBoxesFromCart: async ({
        UserId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let { id: CartId } = cart
        let info = await removeBoxesFromCartFloorItem({
            UserId, CartId, mil_type, boxes_amount, FloorTileSizeId, FloorId, cart
        })
        if (info === false) throw new ErrorHandler(403, "No item of this type to be managed.")
        return info
    },
    removeItemFromCart: async ({
        UserId, CartFloorItemId
    }) => {
        let { id: CartId } = await getUserActiveCart({ UserId });
        await deleteCartFloorItem({ CartId, CartFloorItemId })
        return await getUserActiveCart({ UserId });
    },
    checkoutMyCart: async ({
        UserId
    }) => {
        let cart_floor_items = await getMyCartFloorItemsInfo({ UserId })
        if (!cart_floor_items.length) throw new ErrorHandler(403, "EmptyCart", [
            "No items in cart to procceed with checkout."
        ])
        let CartId = cart_floor_items[0].CartId
        let some_not_available_check = cart_floor_items.find(x => !x.in_stock);
        if (some_not_available_check) throw new ErrorHandler(403, "Not in stock", [ "Some items are not available anymore" ])
        for (let cart_floor_item of cart_floor_items){
            let { FloorTileSizeId, FloorId, mil_type, boxes_amount } = cart_floor_item;
            await FloorBox.update({ CartFloorItemId: cart_floor_item.id}, {
                where: {
                    FloorTileSizeId, FloorId, mil_type,
                    CartFloorItemId: null
                },
                limit: boxes_amount
            })
        }
        let invoice = await Invoice.create({
            check_id: uuid.v4(),
            last_four_digits: "4444",
            price: await getTotalPrice({ cart_floor_items }),
            receipt_url: uuid.v4(),
            UserId
        })
        let order = await Order.create({
            UserId, CartId,
            InvoiceId: invoice.id
        })
        await Cart.update({ status: "COMPLETED" }, { where: { id: CartId }})
        return order;
    },
    findOrder: async ({
        UserId, OrderId
    }) => {
        let order = await Order.findOne({
            where: {
                id: OrderId, UserId
            }
        })
        order = JSON.parse(JSON.stringify(order));
        order.Cart = await findOneCart({ id: order.CartId })
        return JSON.parse(JSON.stringify(order));
    },
    cancelOrder: async ({
        UserId, OrderId
    }) => {
        let order = await Order.findOne({
            where: {
                id: OrderId, UserId
            }
        })
        if (!order) throw new ErrorHandler(404,"Order not found",[
            "Order not found"
        ])
        order.status = "CANCELED";
        await order.save();
        return order;
    }
}