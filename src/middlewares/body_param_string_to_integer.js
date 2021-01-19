

module.exports = (key) => (req,res,next) => {
    if (key.indexOf(".") !== -1){
        let [key1,key2] = key.split(".")
        try {
            console.log(key,key1,key2,req.body[key1],req.body[key1][key2])
            if (req.body[key1][key2] && typeof(req.body[key1][key2]) === "string" && !isNaN(Number(req.body[key1][key2]))) {
                req.body[key1][key2] = Number(req.body[key1][key2])
            }
        } catch(err) {
            console.log(err)
        }
    } else {
        console.log(req.body,req.body.body,"SDADAADSADADDAHSDKASJDKASJDKJGAJSD")
        console.log(key,req.body[key],typeof(req.body[key]) === "string",!isNaN(Number(req.body[key])))
        if (req.body[key] && typeof(req.body[key]) === "string" && !isNaN(Number(req.body[key]))) {
            req.body[key] = Number(req.body[key])
        }
    }
    return next();
}