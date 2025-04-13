import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { CheckoutSuccess, createCheckoutSession } from '../controllers/payment.controller.js';

const router = express.Router();

router.post("/create-checkout-session",protectRoute,createCheckoutSession);
router.post("/checkout-success",protectRoute,CheckoutSuccess);

export default router