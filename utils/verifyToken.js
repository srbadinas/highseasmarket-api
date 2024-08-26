import { verifyJwt } from "./jwt.js";

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Authentication required.');
    const decoded = verifyJwt(token);
    if (!decoded) return res.status(403).send('Invalid token.');
    req.user = decoded;
    next();
};

export default verifyToken;