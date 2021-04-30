const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: 'http://localhost:8080/solyd_floors_ecommerce',
  consumerKey: 'ck_04ae8c241335597609850ccdcba28bb59d09d6a5',
  consumerSecret: 'cs_b43550d777fa6d7c4f94e9612ba90d32e1da729f',
  version: 'wc/v3'
});

let insertVariationsIntoFloor = async floor => {
  let endpoint = `products/${floor.id}/variations`
  let { data: Variations } = await WooCommerce.get(endpoint)
  floor.Variations = Variations;
}

let insertThumbnailIntoFloor = floor => {
  let default_image = floor.images[0]
  floor.thumbnail_url = default_image.src || null
}

let insertPlankDimensionsIntoFloor = floor => {
  let plank_dimensions = floor.attributes.find(x => x.name === "Plank dimensions").options[0]
  floor.plank_dimensions = plank_dimensions
}

let findByPkOr404 = async floor_id => {
  let endpoint = `products/${floor_id}`
  let { data: floor } = await WooCommerce.get(endpoint);
  await insertVariationsIntoFloor(floor)
  await insertThumbnailIntoFloor(floor)
  insertPlankDimensionsIntoFloor(floor)
  return floor;
}

module.exports = {
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
  findByPkOr404,
  getFloorBoxesInfo: async ({ FloorId, mil_type }) => {
    let floor = await findByPkOr404(FloorId);
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
  }
}