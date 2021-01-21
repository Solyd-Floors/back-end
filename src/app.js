if (!process.env.DONT_USE_DOTENV) require('dotenv').config()

require('express-async-errors');

const models = require("./models")

models.sequelize.sync({ force: false || process.env.RESET_DB_FORCE });

const http = require('http');
const express = require('express')
const compression = require("compression");
const bodyParser = require("body-parser")
const logger = require("morgan")("dev")
const mung = require("express-mung");
const DocsCollector = require("docs-collector")

const docs_collector = new DocsCollector(
    __dirname + "/libs/api-docs/swagger-input.json",
    __dirname + "/libs/api-docs/swagger.json"
)

global.docs_collector = docs_collector;

const { errorHandler, allowCrossDomain } = require("./middlewares")

const users_api = require("./libs/users-api")
const businesses_api = require("./libs/businesses-api")
const employees_api = require("./libs/employees-api")
const industries_api = require("./libs/industries-api")
const me_api = require("./libs/me-api")
const auth_api = require("./libs/auth-api")
const brands_api = require("./libs/brands-api")
const installers_api = require("./libs/installers-api")
const floors_api = require("./libs/floors-api")
const floor_types_api = require("./libs/floor-types-api")
const floor_categories_api = require("./libs/floor-categories-api")
const floor_tile_sizes_api = require("./libs/floor-tile-sizes-api")
const floor_boxes_api = require("./libs/floor-boxes-api")
const countries_api = require("./libs/countries-api")
const contacts_api = require("./libs/contacts-api")
const team_members_api = require("./libs/team-members-api")
const videos_api = require("./libs/videos-api")
const colors_api = require("./libs/colors-api")
const carts_api = require("./libs/carts-api")
const orders_api = require("./libs/orders-api")
const inventory_api = require("./libs/inventory-api")

docs_collector.generateSwaggerDocument()
const api_docs = require("./libs/api-docs");

const app = express();
const server = http.createServer(app)

// const { getFloorPrice } = require('./libs/floors-dal');
// app.use(mung.jsonAsync(
//     async function transform(body,req,res) {
//         let data = body.data;
//         console.log(data,1222)
//         if (!data) return body
//         floor = data.floor;
//         console.log(floor,1222)
//         if (!floor) return body
//         floor.price = await getFloorPrice(floor)
//         console.log(data.price,"data.price")
//         return body;
//     }
// ))

app.use(compression())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.json({limit: '50mb'}));
app.use(logger)
app.use(allowCrossDomain)

const V1_PATHNAME_PREFIX = "/api/v1";

app.use(V1_PATHNAME_PREFIX, api_docs)
app.use(V1_PATHNAME_PREFIX, auth_api)
app.use(V1_PATHNAME_PREFIX, users_api)
app.use(V1_PATHNAME_PREFIX, businesses_api)
app.use(V1_PATHNAME_PREFIX, employees_api)
app.use(V1_PATHNAME_PREFIX, industries_api)
app.use(V1_PATHNAME_PREFIX, me_api)
app.use(V1_PATHNAME_PREFIX, team_members_api)
app.use(V1_PATHNAME_PREFIX, contacts_api)
app.use(V1_PATHNAME_PREFIX, brands_api);
app.use(V1_PATHNAME_PREFIX, installers_api);
app.use(V1_PATHNAME_PREFIX, floors_api);
app.use(V1_PATHNAME_PREFIX, floor_types_api);
app.use(V1_PATHNAME_PREFIX, floor_categories_api)
app.use(V1_PATHNAME_PREFIX, floor_tile_sizes_api)
app.use(V1_PATHNAME_PREFIX, floor_boxes_api)
app.use(V1_PATHNAME_PREFIX, countries_api);
app.use(V1_PATHNAME_PREFIX, videos_api);
app.use(V1_PATHNAME_PREFIX, colors_api);
app.use(V1_PATHNAME_PREFIX, carts_api);
app.use(V1_PATHNAME_PREFIX, orders_api);
app.use(V1_PATHNAME_PREFIX, inventory_api);

// const V2_PATHNAME_PREFIX = "/api/v2";

// app.use(mung.jsonAsync(
//     async function transform(body,req,res) {
//         let data = body.data;
//         if (!data) return body
//         if (Object.keys(data).length !== 1) return body;
//         let key = Object.keys(data)[0]
//         let list = data[key]
//         if (typeof(list) !== "object" || list.length === undefined) return body;
//         let transformed = { ...body, data: list }
//         return [ list[0] ];
//     }
// ))

// app.use(V2_PATHNAME_PREFIX, floor_boxes_api)

app.get('/', (req, res) => res.json({ versions: [ "v1"] }))

app.get("*", (req,res) => res.status(404).json({
    code: 404,
    message: "API Endpoint not found, if this is unexpected please contact the developer."
}))

app.use(errorHandler)

if (require.main === module) {
    const PORT = process.env.PORT || 4000;
    server.listen(PORT,() => console.log("Running on port: ",PORT))
}

module.exports = app