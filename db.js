import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    }
});

export const query = async (sql, values) => {
    const client = await pool.connect();
    try {
        const {rows} = await client.query(sql, values);
        return rows;
    } catch (err) {

    } finally {
        client.release();
    }
}
