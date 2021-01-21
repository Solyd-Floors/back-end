const jwt = require("jsonwebtoken")

module.exports = (key, value, extra = {}, expiresIn, explicit_jwt_secret) => {
    let options = {}
    if (expiresIn) options.expiresIn = expiresIn;
    const token = jwt.sign({
        [key]: value,
        ...extra
    }, explicit_jwt_secret + `_${key}` || process.env.JWT_SECRET, options);
    return token
}