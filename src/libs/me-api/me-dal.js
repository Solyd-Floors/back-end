
const { getFloorBoxesInfo } = require("../floor-boxes-dal");
const { ErrorHandler } = require("../../utils/error");
const { findAll: findAllCartFloorBoxes } = require("../cart-floor-boxes-dal");
const { 
    Floor, 
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
const { findProductByPkOr404, addLineItemToOrder, setOrderTransactionId, removeLineItemFromOrder, getCustomerOrders } = require("../woocommerce");
const { findByPk: findUserByPk } = require("../users-api/users-dal");
const { chargeCustomer } = require("../stripe");

const getMyCartFloorItemsInfo = async ({
    UserId
}) => {
    let { id: CartId } = await getUserActiveCart({ UserId });
    let cart_floor_items = await findAllForCartCartFloorItems({ CartId })
    cart_floor_items = cart_floor_items.map(async cart_floor_item => {
        cart_floor_item = JSON.parse(JSON.stringify(cart_floor_item))
        let { FloorId,mil_type, boxes_amount } = cart_floor_item
        let stock_info = await getFloorBoxesInfo({
            mil_type, FloorId,limit: boxes_amount
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
        let {  FloorId, mil_type, boxes_amount } = cart_floor_item;
        let floor_box = await FloorBox.findOne({ where: { 
             FloorId, mil_type
        }})
        if (!floor_box) return 0
        price += floor_box.price_per_square_foot * boxes_amount
    }
    return price;
}

module.exports = {
    getOrders: async ({ woo_customer_id }) => {
        let woo_orders = await getCustomerOrders({ woo_customer_id })
        let orders = []
        for (let woo_order of woo_orders) {
            let _stripe_charge_ = woo_order.meta_data.find(x => x.key === "_stripe_charge_")
            if (!_stripe_charge_) continue;
            let { receipt_url } = JSON.parse(_stripe_charge_.value);
            let { id, date_paid, total, status } = woo_order;
            let products = {}
            let findP = async product_id => {
                console.log("findP",product_id)
                let product = products[product_id]
                if (!product){
                    product = await findProductByPkOr404(product_id)
                }
                products[product_id] = product;
                console.log("FINISHED", product.id)
                return product;
            }
            let per_line_item_orders = woo_order.line_items.map( async line_item => ({
                id, receipt_url, date_paid, total, line_item, status,
                product: await findP(line_item.product_id)
            }))
            per_line_item_orders = await Promise.all(per_line_item_orders)
            orders = orders.concat(per_line_item_orders);
        }
        return orders;
    },
    getInvoices: async ({ woo_customer_id }) => {
        let woo_orders = await getCustomerOrders({ woo_customer_id })
        let invoices = []
        for (let woo_order of woo_orders) {
            let _stripe_charge_ = woo_order.meta_data.find(x => x.key === "_stripe_charge_")
            if (!_stripe_charge_) continue;
            let { receipt_url } = JSON.parse(_stripe_charge_.value);
            let products = woo_order.line_items.map(x => `${x.name} - ${x.quantity * 23.4}sqft`);
            let { id, date_paid, total, status } = woo_order;
            invoices.push({
                id, receipt_url, date_paid, total, products, status
            })
        }
        return invoices;
    },
    discardCart: async UserId => {
        let cart = await getUserActiveCart({ UserId, not_json: true })
        cart.status = "DISCARDED"
        console.log({cart},cart.update, cart.save)
        await cart.save();
        return cart;
    },
    addBoxesToCart2: async ({
        UserId, mil_type, boxes_amount,FloorId 
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let { id: CartId } = cart
        // let boxes_already_in_cart = await findAllForCartWhere(cart.id,{
        //     where: {
        //          FloorId, mil_type
        //     }
        // })
        // let current_boxes_number = 0;
        // boxes_already_in_cart.map(x => (current_boxes_number += x))

        let stock_info = await getFloorBoxesInfo({
            mil_type, FloorId,limit: boxes_amount, cart
        })

        let stock_available = stock_info.boxes >= boxes_amount //+ current_boxes_number

        if (!stock_available) throw new ErrorHandler(403, "No stock available", stock_info)

        let cart_floor_item = await findOneCartFloorItem({
            CartId, mil_type,FloorId 
        })
        if (!cart_floor_item) cart_floor_item = await createCartFloorItem({
            CartId, mil_type, boxes_amount,FloorId
        })
        else {
            cart_floor_item.boxes_amount += boxes_amount
            await cart_floor_item.save()
        }
        return cart_floor_item;
    },
    addBoxesToCart3: async ({
        UserId, mil_type, boxes_amount,FloorId, variation_id
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let { id: CartId } = cart
        // let boxes_already_in_cart = await findAllForCartWhere(cart.id,{
        //     where: {
        //          FloorId, mil_type
        //     }
        // })
        // let current_boxes_number = 0;
        // boxes_already_in_cart.map(x => (current_boxes_number += x))
        let floor = await findProductByPkOr404(FloorId);
        console.log(cart)
        let cart_line_item = cart.woo_order.line_items.find(
            x => x.product_id == floor.id
        ) || { quantity: 0 }
        let variation = floor.Variations.find(x => x.id === variation_id)

        let new_quantity = cart_line_item.quantity + boxes_amount
        let stock_available = variation.stock_quantity >= new_quantity //+ current_boxes_number

        if (!stock_available) throw new ErrorHandler(403, "No stock available")

        let { woo_order } = cart;
        console.log({
            product_id: floor.id,
            variation_id,
            quantity: new_quantity
        })
        let new_woo_order = await addLineItemToOrder({ 
            woo_order,
            product_id: floor.id,
            variation_id,
            quantity: boxes_amount
        })
        
        cart = JSON.parse(JSON.stringify(cart));
        cart.woo_order = new_woo_order

        return cart;
    },
    getMyCartFloorItemsInfo,
    removeBoxesFromCart: async ({
        UserId, mil_type, boxes_amount,FloorId 
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let { id: CartId } = cart
        let info = await removeBoxesFromCartFloorItem({
            UserId, CartId, mil_type, boxes_amount,FloorId, cart
        })
        if (info === false) throw new ErrorHandler(403, "No item of this type to be managed.")
        return info
    },
    removeItemFromCart: async ({
        UserId, line_item_id
    }) => {
        let { woo_order } = await getUserActiveCart({ UserId });
        await removeLineItemFromOrder({ woo_order, line_item_id })
        return await getUserActiveCart({ UserId });
    },
    checkoutMyCart: async ({
        UserId
    }) => {
        let cart = await getUserActiveCart({ UserId });
        let user = await findUserByPk(UserId);
        if (user.isGuest){
            throw new ErrorHandler(403, "ValidationError", [
                "Checkout functionality not allowed for guest users."
            ])
        }
        let { woo_order } = cart;
        let charge;
        try {
            charge = await chargeCustomer({
                order_id: woo_order.id,
                customer_id: user.customer_id,
                amount: Number(woo_order.total) * 100
            })
        } catch(err){ 
            if (err.code === "missing") {
                throw new ErrorHandler(err.statusCode,err.type, [
                    "Please add a card."
                ])            
            }
            throw new ErrorHandler(err.statusCode,err.type, [
                err.raw.message
            ])
        }
        let new_order = await setOrderTransactionId({
            order_id: woo_order.id, 
            transaction_id: charge.id,
            charge
        })
        cart = await getUserActiveCart({ UserId, not_json: true });
        cart.status = "COMPLETED",
        await cart.save();
        cart = JSON.parse(JSON.stringify(cart));
        cart.woo_order = new_order
        return cart;
        // let cart_floor_items = await getMyCartFloorItemsInfo({ UserId })
        // if (!cart_floor_items.length) throw new ErrorHandler(403, "EmptyCart", [
        //     "No items in cart to procceed with checkout."
        // ])
        // let CartId = cart_floor_items[0].CartId
        // let some_not_available_check = cart_floor_items.find(x => !x.in_stock);
        // if (some_not_available_check) throw new ErrorHandler(403, "Not in stock", [ "Some items are not available anymore" ])
        // for (let cart_floor_item of cart_floor_items){
        //     let {  FloorId, mil_type, boxes_amount } = cart_floor_item;
        //     await FloorBox.update({ CartFloorItemId: cart_floor_item.id}, {
        //         where: {
        //              FloorId, mil_type,
        //             CartFloorItemId: null
        //         },
        //         limit: boxes_amount
        //     })
        // }
        // let invoice = await Invoice.create({
        //     check_id: uuid.v4(),
        //     last_four_digits: "4444",
        //     price: await getTotalPrice({ cart_floor_items }),
        //     receipt_url: uuid.v4(),
        //     UserId
        // })
        // let order = await Order.create({
        //     UserId, CartId,
        //     InvoiceId: invoice.id
        // })
        // await Cart.update({ status: "COMPLETED" }, { where: { id: CartId }})
        // return order;
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