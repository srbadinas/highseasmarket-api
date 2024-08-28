
import { query } from '../db.js';

export const getCount = async (user_id) => {
    let queryStr = 'SELECT COUNT(id) as count FROM products';
    const queryParams = [];

    if (user_id) {
        queryStr += ' WHERE created_by_user_id = $1';
        queryParams.push(created_by_user_id);
    }

    const [data] = await query(queryStr, queryParams);

    return data;
}

export const getAll = async () => {
    return await query('SELECT id, name, price, is_published, created_date, last_updated_date as count FROM products ORDER BY created_date DESC');
}

export const getSingle = async (id) => {
    const [product] = await query('SELECT id, name, description, product_category_id, unit_id, is_published, created_date, last_updated_date, created_by_user_id, slug, price, stock, is_custom_unit, custom_unit FROM products WHERE id = $1 LIMIT 1', [id]);
    return product;
}

export const store = async (data) => {
    const { name, description, slug, product_category_id, unit_id, is_published, created_by_user_id, price, stock } = data;
    const product = await query('INSERT INTO products (name, description, product_category_id, unit_id, is_published, created_by_user_id, slug, price, stock) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [name, description, product_category_id, unit_id, is_published, created_by_user_id, slug, price, stock]);
    console.log(product);
    return true;
}

export const update = async (data) => {
    const { id, name, description, slug, product_category_id, unit_id, is_published, last_updated_by_user_id, price, stock } = data;
    const [product] = await query('UPDATE products SET name = $1, description = $2, slug = $3, product_category_id = $4, unit_id = $5, is_published = $6, last_updated_by_user_id = $7, price = $8, stock = $9 WHERE id = $10', [name, description, slug, product_category_id, unit_id, is_published, last_updated_by_user_id, price, stock, id]);

    return product;
}

export const destroy = async (id) => {
    await query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await query('DELETE FROM product_views WHERE product_id = $1', [id]);
    await query('DELETE FROM products WHERE id = $1', [id]);
    return true;
}

// Product Images

export const getImages = async (product_id) => {
    return await query('SELECT id, image_url, is_active, created_date, product_id FROM product_images WHERE product_id = $1', [product_id]);
}

export const getExistingImages = async (product_id, image_url) => {
    return await query('SELECT id, image_url, is_active, created_date, product_id FROM product_images WHERE product_id = $1 AND image_url = $2', [product_id, image_url]);
}

export const addImage = async (data) => {
    const { product_id, image_url, is_active } = data;
    const image = await query('INSERT INTO product_images (product_id, image_url, is_active) VALUES ($1,$2,$3) RETURNING *', [product_id, image_url, is_active]);
    return true;
}