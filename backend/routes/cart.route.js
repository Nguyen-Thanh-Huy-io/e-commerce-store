import express from 'express';
import { addToCart, getCartProducts, removeFromCart, updateQuantity } from '../controllers/cart.controller';
import { protectRoute } from '../middleware/protectRoute';

const router = express.Router();

router.get("/",protectRoute,getCartProducts);
router.post("/",protectRoute,addToCart);
router.delete("/",protectRoute,removeFromCart);
router.put("/:id",protectRoute,updateQuantity);

export default router