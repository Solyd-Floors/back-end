
const { createCartFloorBox } = require("../cart-floor-boxes-dal");
const { getFloorBoxesInfo } = require("../floor-boxes-dal");
const { ErrorHandler } = require("../../utils/error");
const { findAll: findAllCartFloorBoxes } = require("../cart-floor-boxes-dal");
const { FloorBox } = require("../../models");
const { findOne: findOneCartFloorItem, findAllOnCart, removeBoxesFromCartFloorItem, deleteCartFloorItem } = require("../cart-floor-items-dal");
const { createCartFloorItem, findAllForCart: findAllForCartCartFloorItems } = require("../cart-floor-items-dal");
const { getUserActiveCart } = require("../me-dal")

const addBoxToCart = async ({ CartId, FloorBoxId }) => {
    let cartFloorBox = await createCartFloorBox({ 
        CartId, FloorBoxId
    })
    return cartFloorBox
}

module.exports = {
    discardCart: async UserId => {
        let cart = await getUserActiveCart({ UserId, not_json: true })
        cart.status = "DISCARDED"
        console.log({cart},cart.update, cart.save)
        await cart.save();
        return cart;
    },
    addBoxesToCart: async ({ UserId, amount, mil_type, FloorId, FloorTileSizeId }) => {
        let cart = await getUserActiveCart({ UserId });
        let boxes_already_in_cart = await findAllCartFloorBoxes({ 
                CartId: cart.id,
                mil_type, FloorId, FloorTileSizeId 
        })
        let exclude_ids = boxes_already_in_cart.map(x => x.FloorBoxId);
        let stock_info = await getFloorBoxesInfo({
            mil_type, FloorId, FloorTileSizeId, limit: amount,
            exclude_ids
        })
        let stock_available = stock_info.boxes >= amount
        if (!stock_available) throw new ErrorHandler(403, "No stock available", stock_info)
        console.log(stock_available)
        let ops = []
        for (let floor_box of stock_info.floor_boxes) {
            ops.push(addBoxToCart({ 
                FloorBoxId: floor_box.id,
                CartId: cart.id
            }))
        }
        await Promise.all(ops);
        return await getUserActiveCart({ UserId, include: [ FloorBox ] })
    },
    addBoxesToCart2: async ({
        UserId, mil_type, boxes_amount, FloorTileSizeId, FloorId 
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let { id: CartId } = cart
        let stock_info = await getFloorBoxesInfo({
            mil_type, FloorId, FloorTileSizeId, limit: boxes_amount, cart
        })

        let stock_available = stock_info.boxes >= boxes_amount

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
    getMyCartFloorItemsInfo: async ({
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
    },
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
    }
}