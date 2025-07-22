const Order = require("../models/orders");
const Product = require("../models/product");
const User = require("../models/user");



const kpiCalculator = async (req, res) => {
    try {
        const orders = await Order.find();


        const totalOrders = orders.length;
        const totalUsers = User.length;
        const totalProducts = Product.length;
        const revenue = orders.reduce((acc, order) => acc + order.totalCost, 0);

        res.status(200).json({
            totalOrders,
            totalUsers,
            totalProducts,
            revenue,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}