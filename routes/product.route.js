import express from "express";
import { getAllProducts, getProduct, addProduct, updateProduct, deleteProduct, getProductCount } from "../controllers/product.controller.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

router.get('/count', verifyToken, getProductCount);

router.get('/', verifyToken, getAllProducts);
router.get('/:id', verifyToken, getProduct);
router.post('/', verifyToken, addProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);




export default router;