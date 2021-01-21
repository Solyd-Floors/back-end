const cors = require('cors')

module.exports = cors({
    exposedHeaders: ["Content-Range"]
})