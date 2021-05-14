const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WOO_COMMERCE_URL || 'http://localhost:8080/solyd_floors_ecommerce',
  consumerKey: process.env.WOO_CONSTUMER_KEY || 'ck_be7de3a8b20a93f1c7f771e8a35136632622beb8',
  consumerSecret: process.env.WOO_CONSTUMER_SECRET || 'cs_3f44f5edd71153f1d5d91aaec91a6e4e330d65a0',
  version: 'wc/v3'
});

let insertVariationsIntoFloor = async floor => {
  let endpoint = `products/${floor.id}/variations`
  let { data: Variations } = await WooCommerce.get(endpoint)
  floor.Variations = Variations;
}

let insertThumbnailIntoFloor = floor => {
  let default_image = floor.images[0]
  floor.thumbnail_url = default_image && default_image.src || null
  if (!floor.thumbnail_url) floor.thumbnail_url = "http://128.199.9.194/wp-content/uploads/woocommerce-placeholder-324x324.png"
}

let insertPlankDimensionsIntoFloor = floor => {
  let plank_dimensions = floor.attributes.find(x => x.name === "Plank dimensions").options[0]
  floor.plank_dimensions = plank_dimensions
}

let findProductByPkOr404 = async floor_id => {
  let endpoint = `products/${floor_id}`
  let { data: floor } = await WooCommerce.get(endpoint);
  await insertVariationsIntoFloor(floor)
  await insertThumbnailIntoFloor(floor)
  insertPlankDimensionsIntoFloor(floor)
  return floor;
}

module.exports = {
  getCustomerOrders: async ({ woo_customer_id }) => {
    console.log({woo_customer_id})
    let response = await WooCommerce.get("orders",{ 
      customer: woo_customer_id,
      status: "processing,on-hold,completed,cancelled,refunded,failed,trash"
    })
    let { data: orders } = response;
    return orders;
  },
  "default": WooCommerce,
  WooCommerce,
  getFloors: async () => {
    let response = await WooCommerce.get("products")
    let { data: floors } = response;
    for (let floor of floors){
      await insertVariationsIntoFloor(floor)
      await insertThumbnailIntoFloor(floor)
      insertPlankDimensionsIntoFloor(floor)
    }
    return floors;
  },
  findCheapestFloorBoxPriceFor: async ({ floor }) => {
    let { Variations: variations } = floor;
    let price;
    for (let variation of variations){
      let variation_price = Number(variation.price);
      if (variation_price < price || price === undefined) price = variation_price; 
    }
    return price || null;
  },
  findProductByPkOr404,
  getFloorBoxesInfo: async ({ FloorId, mil_type }) => {
    let floor = await findProductByPkOr404(FloorId);
    let variation = floor.Variations.find(x => x.attributes[0].option.split(" ")[0] == mil_type)
    let { 
      stock_quantity: boxes, 
      price: price_per_square_foot 
    } = variation;
    let square_feet_available = boxes * 23.4
    return {
      boxes,
      pallets: Math.floor(boxes / 50),
      square_feet_available,
      price_per_square_foot,
    }
  },
  createWooCustomer: async ({ user }) => {
    let { email, first_name, last_name, username, address: address_1, phone } = user
    const data = {
      email,
      first_name,
      last_name,
      username,
      billing: {
        first_name: String(first_name),
        last_name: String(first_name),
        address_1: String(address_1),
        email: String(email),
        phone: String(phone)
      },
      shipping: {
        first_name: String(first_name),
        last_name: String(last_name),
        company: "",
        address_1: String(address_1),
        address_2: "",
        city: "San Francisco",
        state: "CA",
      },
      meta_data: [
        { user_id: user.id }
      ]
    };
    let { data: woo_customer } = await WooCommerce.post("customers", data)
    console.log(woo_customer)
    return woo_customer;
  },
  createPendingOrder: async ({ user }) => {
    const data = {
      payment_method: user.customer_id,
      payment_method_title: "Credit Card (Stripe)",
      customer_id: user.woo_customer_id,
      line_items: [ ],
    };
    let res = await WooCommerce.post("orders", data)
    console.log(res);
    return res.data;
  },
  findOrderById: async id => {
    let res = await WooCommerce.get("orders/" + id)
    console.log(res.data)
    return res.data;
  },
  addLineItemToOrder: async ({ woo_order, product_id, quantity, variation_id }) => {
    let line_items = woo_order.line_items
    line_item = { product_id, variation_id, quantity }
    line_items.push(line_item);
    let { data: order } = await WooCommerce.put("orders/" + woo_order.id, { line_items })
    return order;
  },
  removeLineItemFromOrder: async ({ woo_order, line_item_id }) => {
    let line_item = woo_order.line_items.find(x => x.id === line_item_id);
    line_item.quantity = 0;
    let line_items = woo_order.line_items.filter(
      x => x.id !== line_item_id
    );
    line_items.push(line_item);
    let { data: order } = await WooCommerce.put("orders/" + woo_order.id, { line_items })
    return order;
  },
  setOrderTransactionId: async ({ order_id, transaction_id, charge }) => {
    console.log(charge,JSON.stringify(charge))
    let data = { 
      transaction_id, 
      status: "completed",
      meta_data: [
        {
          key: "_stripe_charge_",
          value: JSON.stringify(charge)
        }
      ]
    }
    let { data: order } = await WooCommerce.put("orders/" + order_id, data)
    return order;
  }
}