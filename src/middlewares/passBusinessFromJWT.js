
const { findByPk: findBusinessByPk } = require("../libs/businesses-dal");
const { ErrorHandler } = require("../utils/error")

module.exports = async (req, res, next) => {
    req.business = await findBusinessByPk(req.auth.businessId)
    if (!req.business) throw new ErrorHandler(401, "Unauthorized")
    return next();
}