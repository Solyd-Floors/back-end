const { Interpreter: JtsInterpreter} = require("./libs/yup-to-swagger-tool")
const yup = require("yup");

const jts_interpreter = new JtsInterpreter();

jts_interpreter.securitySchemes = {
    "jwt_auth" : {
        "description" : "Example value: \"Bearer <jwt_token>\"",
        "type" : "apiKey",
        "name" : "Authorization",
        "in" : "header"
    }
}
jts_interpreter.paths = {}
jts_interpreter.tags = []
jts_interpreter._parse_schema = jts_interpreter.parse_schema

jts_interpreter.parse_schema = yupSchema => {
    console.log(yupSchema,99)
    let path_schema = jts_interpreter._parse_schema(yupSchema);
    // console.log(path_schema,22,Object.keys(path_schema)[0])
    let key = Object.keys(path_schema)[0]
    let a = jts_interpreter.paths[key]
    if (!a) jts_interpreter.paths[key] = {}
    let sub_key = Object.keys(path_schema[Object.keys(path_schema)[0]])[0]
    jts_interpreter.paths[key][sub_key] = path_schema[key][sub_key]
    return path_schema
}

jts_interpreter._tag_schema_ = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required()
})
jts_interpreter.add_tag = ({ name, description }) => {
    jts_interpreter._tag_schema_.validateSync({
        name, description
    })
    jts_interpreter.tags.push({
        name, description
    })
}

module.exports = jts_interpreter