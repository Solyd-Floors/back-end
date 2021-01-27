const { ErrorHandler } = require("../utils/error");


module.exports = (auth_middlewares) => async (req,res,next) => {
    for (auth_middleware of auth_middlewares){
        try {
            return await auth_middleware(req,res,next);
        } catch(err){
            console.log(err.message, auth_middleware);
        }
    }
    throw new ErrorHandler(401, "Unauthorized");
}