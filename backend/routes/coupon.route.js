import express from 'express';

const router = express.Router();

router.get("/",protectRoute,getCoupon);
router.post("/validate",protectRoute,validateCoupon);

export default router