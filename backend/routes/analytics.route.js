import express from 'express';
import { adminRoute, protectRoute } from '../middleware/protectRoute.js';
import { getAnalyticsData, getDailySalesData } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get("/", protectRoute,adminRoute , async (req,res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTim() - 7 * 24 * 60 * 60 * 1000)

        const DailySalesData = await getDailySalesData(startDate, endDate);
        res.json({
            analyticsData,
            DailySalesData,
        })
    } catch (error) {
        throw error;
    }
})

export default router;