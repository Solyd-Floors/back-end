

module.exports = param_key => (req,res,next) => {
    if (
        req.user.id === Number(req.params[param_key])
    ) {}
    else throw new ErrorHandler(401, "Unauthorized")
    return next();
}