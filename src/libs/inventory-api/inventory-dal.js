
const { Sequelize, FloorBox } = require("../../models")
const { v4: uuidv4 } = require('uuid'); 
const { ErrorHandler } = require("../../utils/error");

let getInventory = async () => {
    let floor_boxes = await FloorBox.findAll()

    let items = {}
    for (let floor_box of floor_boxes){
        let { FloorId, FloorTileSizeId, mil_type, price } = floor_box
        if (!items[FloorId]) items[FloorId] = {}
        if (!items[FloorId][FloorTileSizeId]) 
            items[FloorId][FloorTileSizeId] = {}
        if (!items[FloorId][FloorTileSizeId][price]) 
            items[FloorId][FloorTileSizeId][price] = {}
        if (!items[FloorId][FloorTileSizeId][price][mil_type]){
            items[FloorId][FloorTileSizeId][price][mil_type] = 1
        } else {
            items[FloorId][FloorTileSizeId][price][mil_type]++;
        }
    }
    let inventory_items = []
    for (let FloorId in items){
        for (let FloorTileSizeId in items[FloorId]){
            for (let price in items[FloorId][FloorTileSizeId]){
                for (let mil_type in items[FloorId][FloorTileSizeId][price]){
                    inventory_items.push({
                        id: inventory_items.length + 1,
                        FloorId: Number(FloorId),
                        FloorTileSizeId: Number(FloorTileSizeId),
                        price: Number(price),
                        mil_type: Number(mil_type),
                        amount: items[FloorId][FloorTileSizeId][price][mil_type]
                    })
                }
            }
        }
    }
    return inventory_items
}

let findCheaperFloorBox = async ({
    mil_type,
    price,
    FloorId,
    FloorTileSizeId
}) => {
    let floor_box = await FloorBox.findOne({
        where: { mil_type, FloorId, FloorTileSizeId, price: { [Sequelize.Op.not]: price } }
    })
    if (!floor_box) return;
    console.log({floor_box})
    return floor_box;
}

let addFloorBoxes = async ({
    mil_type,
    price,
    FloorId,
    FloorTileSizeId,
    amount,
    return_undefined
}) => {
    let cheaper = await findCheaperFloorBox({ mil_type, FloorId, FloorTileSizeId, price })
    if (cheaper !== undefined) throw new ErrorHandler(403, "PriceDifferentNotAllowed", [ 
        `There exists floor boxes of the same type with the price ${cheaper.price}, to add others price must be the same.`
    ])
    let FloorBoxData = {
        mil_type,
        price,
        FloorId,
        FloorTileSizeId,    
    }
    let floor_boxes = []
    for (let x=0;x<amount;x++){
        floor_boxes.push({
            ...FloorBoxData,
            SKU: `AUTO-${uuidv4()}`  
        })
    }
    await FloorBox.bulkCreate(floor_boxes)
    if (return_undefined) return;
    return await getInventory()
}

let deleteFloorBoxes = async ({
    mil_type,
    price,
    FloorId,
    FloorTileSizeId,
    amount,
    return_undefined
}) => {
    await FloorBox.destroy({ 
        where: {
            mil_type,
            price,
            FloorId,
            FloorTileSizeId,          
        },
        limit: amount
    })
    if (return_undefined) return;
    return await getInventory()
}

module.exports = {
    getInventory,
    addInventory: addFloorBoxes,
    updateInventory: async ({ before, after }) => {
        let { amount: before_amount, price: before_price, ...before_rest } = before
        let { amount: after_amount, ...after_rest } = after
        let current_floor_boxes = await FloorBox.count({ where: before_rest })
        console.log({current_floor_boxes, before_rest})
        if (current_floor_boxes !== before_amount) throw new ErrorHandler(403,"Invalid amount", [
            `This is probably a persisent bug, please report to the developer. ${current_floor_boxes} !== ${before_amount}`
        ]) 
        let add;
        let remove;
        if (before_amount > after_amount) remove = before_amount - after_amount
        if (before_amount < after_amount) add = after_amount - before_amount
        if (add) await addFloorBoxes(after_rest, true)
        if (remove) await deleteFloorBoxes(after_rest, true)
        await FloorBox.update(after_rest, { 
            where: before_rest
        })
        return await getInventory()
    },
}