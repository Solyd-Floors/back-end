if (!process.env.DONT_USE_DOTENV) require('dotenv').config()

require('express-async-errors');

const models = require("./models")

models.sequelize.sync({ force: true });

const http = require('http');
const express = require('express')
const compression = require("compression");
const bodyParser = require("body-parser")
const logger = require("morgan")("dev")
const DocsCollector = require("docs-collector")

const docs_collector = new DocsCollector(
    __dirname + "/libs/api-docs/swagger-input.json",
    __dirname + "/libs/api-docs/swagger.json"
)

global.docs_collector = docs_collector;

const { errorHandler, allowCrossDomain } = require("./middlewares")

const users_api = require("./libs/users-api")
const auth_api = require("./libs/auth-api")
const api_docs = require("./libs/api-docs")
const floor_categories_api = require("./libs/floor-categories-api")
const floor_types_api = require("./libs/floor-types-api")
const brands_api = require("./libs/brands-api")
const installers_api = require("./libs/installers-api")
const floors_api = require("./libs/floors-api")

const app = express();
const server = http.createServer(app)

app.use(compression())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.json({limit: '50mb'}));
app.use(logger)
app.use(allowCrossDomain)

const PATHNAME_PREFIX = "/api/v1";

docs_collector.generateSwaggerDocument()
app.use(PATHNAME_PREFIX, api_docs)
app.use(PATHNAME_PREFIX, auth_api)
app.use(PATHNAME_PREFIX, users_api)
app.use(PATHNAME_PREFIX, floor_categories_api)
app.use(PATHNAME_PREFIX, floor_types_api);
app.use(PATHNAME_PREFIX, brands_api);
app.use(PATHNAME_PREFIX, installers_api);
app.use(PATHNAME_PREFIX, floors_api);

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