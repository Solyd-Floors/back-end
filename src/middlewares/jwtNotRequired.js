const expressJwt = require('express-jwt');

const shouldIgnoreToken = (token = '') => {
    if (!token) return true;

    const normalizedToken = token.trim();
    if (!normalizedToken) return true;

    return [
        'null',
        'undefined',
        'false'
    ].includes(normalizedToken.toLowerCase());
};

module.exports = expressJwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false,
    requestProperty: 'auth',
    algorithms: ['HS256'],
    getToken: (req) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return null;

        const [scheme, token] = authHeader.split(' ');
        if (!scheme || scheme.toLowerCase() !== 'bearer') return null;
        if (shouldIgnoreToken(token)) return null;

        return token;
    },
});
