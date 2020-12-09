

module.exports = (key) => (req,res,next) => {
    // console.log("TEST[key]: ",req.query.body ? req.query.body.vkb_id : req.query)
    console.log(key,req.query[key],typeof(req.query[key]) === "string",!isNaN(Number(req.query[key])))
    if (req.query[key] && typeof(req.query[key]) === "string" && !isNaN(Number(req.query[key]))) {
        req.query[key] = Number(req.query[key])
    }
    return next();
}