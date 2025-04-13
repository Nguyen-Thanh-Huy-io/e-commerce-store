import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getCoupon, validateCoupon } from '../controllers/coupon.controller.js';

const router = express.Router();

router.get("/",protectRoute,getCoupon);
router.post("/validate",protectRoute,validateCoupon);

export default router