const { ErrorHandler } = require("../utils/error")

const getAcceptableBodyOutput = body => {
    let new_body = JSON.parse(JSON.stringify(body));
    if (new_body.profile_picture_url) new_body.profile_picture_url = "big string here (DEV)"
    return new_body
}

module.exports = (yupSchema,strict = true,options) => {
    return async (req,res,next) => {
        if (options){
            let {
                admin_or_id_is_same_as_val_of_param
            } = options
            if (admin_or_id_is_same_as_val_of_param){
                if (
                    req.user.isAdmin ||
                    req.user.id === Number(req.params[admin_or_id_is_same_as_val_of_param])
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
           throw new ErrorHandler(403,"Validation error",err.errors)
       }
        next()
    }
}