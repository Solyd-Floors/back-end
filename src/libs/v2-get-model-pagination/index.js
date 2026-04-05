// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { 
    allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired,
    query_param_string_to_integer
} = require("../../middlewares");

const { findAll } = require("./dal");
const { ErrorHandler } = require("../../utils/error");

app.use(allowCrossDomain)

const yup = require("yup");

const routes = require("./routes")

for (route of routes){
    app.get(route.path,[
        query_param_string_to_integer("limit"),
        query_param_string_to_integer("offset"),
        validateRequest(
            yup.object().shape({
                query: yup.object().shape({
                    limit: yup.number().integer().positive(),
                    offset: yup.number().integer().positive(),
                })
            })
        )
    ], async (req,res) => {
        let key = route.path.slice(1)
        let result = await findAll({ model: route.model, ...req.query });
        return res.json({
            code: 200,
            message: "success",
            data: { [key]: result }
        })
    })
}