import { getAll, getSingle, store, update, destroy, getCount, getImages, getExistingImages, addImage } from "../services/product.service.js";

export const getProductCount = async (req, res) => {
    const { created_by_user_id } = req.query;
    const data = await getCount(created_by_user_id);
    res.status(200).send({ data: data.count });
}

export const getAllProducts = async (req, res) => {
    const data = await getAll();
    res.status(200).send({ data: data });
}

export const getProduct = async (req, res) => {
    const data = await getSingle(req.params.id);
    if (data) {
        data.images = await getImages(data.id);
    }
    res.status(200).send({ data: data });
}

export const addProduct = async (req, res) => {
    const { name, description, slug, product_category_id, unit_id, is_published, created_by_user_id, price, stock, images } = req.body;
    const product = await store({ name, description, slug, product_category_id, unit_id, is_published, created_by_user_id, price, stock });

    if (images) {
        images.map(async (item, i) => {
            await addImage({ product_id: product.id, image_url: item.image_url, is_active: item.is_active });
        });
    };

    res.status(200).send({ data: product });
}

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, slug, product_category_id, unit_id, is_published, last_updated_by_user_id, price, stock } = req.body;
    const product = await update({ id, name, description, slug, product_category_id, unit_id, is_published, last_updated_by_user_id, price, stock });
    res.status(200).send({ data: product });
}

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    await destroy(id);
    res.status(200).send({ data: true });
}

