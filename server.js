import express from "express";
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import routes from './routes/index.js';
import { signJwtAccessToken, verifyJwt } from "./utils/jwt.js";
import verifyToken from "./utils/verifyToken.js";

const app = express();
const port = 3001;

// Configure CORS
const corsOptions = {
    origin: 'https://highseasmarket.vercel.app',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getLoggedInUser = (token) => {
    return verifyJwt(token);
};

// public routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password_hash, firstname, lastname, address, city, state, zip_code, company, licenses } = req.body;

        const [user] = await query(`INSERT INTO users(email, password_hash, firstname, lastname, address, city, state, zip_code, company, user_type_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [email, password_hash, firstname, lastname, address, city, state, zip_code, company, 3, true]);

        [...licenses].map(async (item) => {
            const { id: licenseId } = await query(`INSERT INTO licenses (license, license_formatted) VALUES ($1, $2) RETURNING *`, [item, item.replace(/ /g, '').toLowerCase()]);
            await query(`INSERT INTO user_licenses (user_id, license_id) VALUES ($1, $2) RETURNING *`, [user.id, licenseId]);
        });

        res.status(201).send({ data: user });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (!user) return res.status(401).send('Invalid email or password');
        let isPasswordValid = await bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) return res.status(401).send('Invalid email or password');
        if (!user.is_active) return res.status(401).send('User is not active');

        const token = signJwtAccessToken(user);
        const result = {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            address: user.address,
            city: user.city,
            state: user.state,
            zip_code: user.zip_code,
            company: user.company,
            user_type_id: user.user_type_id,
            token: token
        };

        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
});

app.get('/api/productCategories', async (req, res) => {
    try {
        const productCategories = await query('SELECT id, product_category from product_categories ORDER BY product_category');
        res.status(200).send({ data: productCategories });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.get('/api/units', async (req, res) => {
    try {
        const units = await query('SELECT id, unit from units ORDER BY unit');
        res.status(200).send({ data: units });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.get('/api/listings/products', async (req, res) => {
    try {
        const products = await query(`SELECT p.id, p.name, p.description, (SELECT product_category FROM product_categories c WHERE c.id = p.product_category_id LIMIT 1) as product_category,
        (SELECT unit FROM units u WHERE u.id = p.unit_id LIMIT 1) as unit, p.created_date, p.slug, p.price, p.stock, p.is_custom_unit, p.custom_unit, (SELECT image_url FROM product_images i WHERE i.product_id = p.id AND is_active = true ORDER BY i.created_date LIMIT 1) as image_url FROM products p WHERE p.is_published = true`);
        console.log(products)
        res.status(200).send({ data: products });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.get('/listings', async (req, res) => { });

// protected routes
app.get('/api/users/getAllActive', verifyToken, async (req, res) => {
    try {
        const users = await query('SELECT id, firstname, lastname, user_type_id, email, created_date FROM users WHERE is_active = true AND user_type_id != 1');
        res.status(200).send({ data: users });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.get('/api/users/count', verifyToken, async (req, res) => {
    try {
        const [data] = await query('SELECT count(id) FROM users');
        res.status(200).send({ data: data.count });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.get('/api/productRequests/count', verifyToken, async (req, res) => {
    try {
        let queryStr = 'SELECT COUNT(id) as count FROM product_requests';
        const queryParams = [];

        const { requested_to_user_id, requested_by_user_id } = req.query;

        if (requested_to_user_id) {
            queryStr += ' WHERE requested_to_user_id = $1';
            queryParams.push(requested_to_user_id);
        }

        if (requested_by_user_id) {
            queryStr += ' WHERE requested_by_user_id = $1';
            queryParams.push(requested_by_user_id);
        }

        const [data] = await query(queryStr, queryParams);

        res.status(200).send({ data: data.count });
    } catch (err) {
        throw new Error(err.message);
    }
});

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

