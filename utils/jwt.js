import jwt from "jsonwebtoken";

export function signJwtAccessToken(payload, options = {
    expiresIn: '24h'
}) {
    const secretKey = process.env.SECRET_KEY;
    const token = jwt.sign(payload, secretKey, options);
    return token;
}

export function verifyJwt(token) {
    try {
        const secretKey = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (err) {
        return null;
    }
}