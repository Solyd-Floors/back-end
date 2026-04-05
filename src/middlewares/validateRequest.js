const { ErrorHandler } = require("../utils/error")
const jts_interpreter = require("../jts_interpreter")

const getAcceptableBodyOutput = body => {
    let new_body = JSON.parse(JSON.stringify(body));
    if (new_body.profile_picture_url) new_body.profile_picture_url = "big string here (DEV)"
    return new_body
}

module.exports = (yupSchema,strict = true,options) => {
    if (options && options.auto_docs_enabled){
        jts_interpreter.parse_schema(yupSchema)
    }
    return async (req,res,next) => {
        if (options){
            let {
                admin_or_id_is_same_as_val_of_param,
                id_is_same_as_val_of_param
            } = options
            if (admin_or_id_is_same_as_val_of_param){
                if (
                    req.user.isAdmin ||
                    req.user.id === Number(req.params[admin_or_id_is_same_as_val_of_param])
                ) {}
                else throw new ErrorHandler(401, "Unauthorized")
            }
            if (id_is_same_as_val_of_param) {
                if (
                    req.user.id === Number(req.params[id_is_same_as_val_of_param])
                ) {}
                else throw new ErrorHandler(401, "Unauthorized")
            }
        }
        if (process.env.DEBUG){
            let acceptable_output = getAcceptableBodyOutput(req.body.body ? req.body.body : req.body)
            console.log({
                requestBody: acceptable_output,
                query: req.query,
                params: req.params
            })
        }
       try {
           await yupSchema.validate({
                requestBody: req.body.body ? req.body.body : req.body,
                query: req.query,
                params: req.params
           }, { abortEarly: false, strict })
       } catch (err) {
           console.log(err,err.errors,99)
           let errors = req.query.err_per_field ? err.inner : err.errors
           throw new ErrorHandler(403,"Validation error",errors)
       }
        next()
    }
}
