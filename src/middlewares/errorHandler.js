
const { ErrorHandler, handleError } = require("../utils/error");

module.exports = (err, req, res, next) => {
    if (process.env.DEBUG)
        console.log(
            err,900,JSON.stringify(err),err instanceof ErrorHandler,"\n",
            "----------------------------------------------"
        )
    if (err instanceof ErrorHandler) return handleError(err, res);
    else if (err.errors) {
        let err_ = new ErrorHandler(403, "ValidationError", err.errors.map(err => err.message))
        return handleError(err_, res);
    }
    else if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            status: "error",
            message:"Unauthorized",
            code: 401,
        })
    }
    else if (err.name.indexOf("Sequelize") !== -1){
        if (
            err.parent.code === "ER_NO_REFERENCED_ROW_2"
        ) {
            let err_ = new ErrorHandler(403, "ValidationError", [ `Invalid ID for field: ${err.fields[0]}`])
            return handleError(err_, res);
        } else if (err.parent.code === "ER_ROW_IS_REFERENCED_2"){
            let err_ = new ErrorHandler(403, "ValidationError", [ `You cannot delete this ${err.fields[0].slice(0,-2)} without deleting everything that is related to it.`])
            return handleError(err_, res);
        }
        throw new Error("Error Handler does not support this type of database error")
        
    } else {
        if (process.env.DEVELOPMENT) throw err;
        else {
            return res.status(500).json({
                status: "error",
                message:"Internal error, please contact the developer!",
                code: 500,
            })
        }
    }
}