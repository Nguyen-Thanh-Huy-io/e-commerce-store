import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async (req, res) => {
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([{
        $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
        },
    }])
    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0}
    return {
        users:totalUsers,
        products:totalProducts,
        totalSales,
        totalRevenue,
    }
}

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: enđate,
                    }
                }
            },
            {
                $group: {
                    _id: { $datetoString : { format : "%Y-%m-%d" , date: "$createdAt"}},
                    sales: { $sum:1 },
                    revenue: { $sum:"totalAmount"}
                }
            },
            {
                $sort: { _id: 1}
            }
        ]);
    
        const DateArray = getDateInRange(startDate, endDate);
        
        return DateArray.map((date) => {
            const foundData = dailySalesData.find((item) => item._id === date);
    
            return {
                date,
                sales: foundData ? foundData.sales : 0,
                revenue: foundData ? foundData.revenue : 0,
            };
        })
    } catch (error) {
        console.log("Error fetching daily sales data:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

function getDateInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}
    