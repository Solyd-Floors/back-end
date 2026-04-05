const express = require("express");
const app = module.exports = express();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require("./swagger.json")
const YAML = require("yamljs");
const { ErrorHandler } = require("../../utils/error");
const jts_interpreter = require("../../jts_interpreter");

swaggerDocument.paths = jts_interpreter.paths
swaggerDocument.tags = jts_interpreter.tags
swaggerDocument.securitySchemes = jts_interpreter.securitySchemes

console.log(swaggerDocument,55)
const swaggerDocumentYAML = YAML.stringify(swaggerDocument)

console.log({swaggerDocument})

app.get("/docs/json", (req,res) => res.json(swaggerDocument))
app.get("/docs/yaml", (req,res) => res.send(swaggerDocumentYAML))
app.get("/docs/json/formatted", (req,res) => res.send(
    JSON.stringify(swaggerDocument, null, "bbbbb")
        .replace(/\n/g, "<br/>")
        .replace(/bbbbb/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
    )
)
app.get("/docs/yaml/formatted", (req,res) => {
    throw new ErrorHandler(501, "Not Implemented")
})
app.get("/docs/mock", (req,res) => {
    throw new ErrorHandler(501, "Not Implemented")
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

