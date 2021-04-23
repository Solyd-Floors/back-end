const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: 'http://localhost:8080/solyd_floors_ecommerce',
  consumerKey: 'ck_60265e868e8ba9fae5af20ecf3a460093eada911',
  consumerSecret: 'cs_60368be16ac69c2dfcece2bc341b9c304fa7e57d',
  version: 'wc/v3'
});

module.exports = WooCommerce