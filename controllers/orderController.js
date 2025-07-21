const Order = require('../models/orders');
const Product = require('../models/product');
const generateUniqueOrderId = require('../utils/genrateOrderID');``
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
  try {
    const { search, status } = req.query;
    const user = req.user;

    const orders = await Order.find({ user: user._id });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Filtered orders
    let filteredOrders = orders;

    if (search || status) {
      const searchLower = search?.toLowerCase() || "";
      const categoryLower = status?.toLowerCase() || "";

      filteredOrders = orders.filter((order) => {
        const matchesSearch = search
          ? (
              order.orderId.toString().toLowerCase().includes(searchLower) || // orderId match
              order.username?.toLowerCase().includes(searchLower)
            )
          : true;

        const matchesStatus = status
          ? order.status?.toLowerCase().includes(categoryLower)
          : true;

        return matchesSearch && matchesStatus;
      });
    }
    const counts = {
      all: filteredOrders.length,
      pending: filteredOrders.filter(order => order.status === "Pending").length,
      processing: filteredOrders.filter(order => order.status === "Processing").length,
      shipped: filteredOrders.filter(order => order.status === "Shipped").length,
      delivered: filteredOrders.filter(order => order.status === "Delivered").length,
      cancelled: filteredOrders.filter(order => order.status === "Cancelled").length,
    };

    // Format to match frontend interface
    const formattedOrders = filteredOrders.map((order) => ({
      id: order._id,
      orderId: order.orderId,
      date: order.createdAt.toISOString(), // or format to "YYYY-MM-DD"
      status: order.status,
      total: order.totalPrice,
      items: order.orderItems.map((item) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        image: item.image,
      })),
      trackingNumber: order.trackingNumber || undefined,
      estimatedDelivery: order.estimatedDelivery || undefined,
    }));
    console.log("Formatted orders:", formattedOrders);

    res.status(200).json({
      orders: formattedOrders,
      counts
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};


const searchOrdersByUsername = async (req, res) => {
  const search = (req.query.q || "").trim()

  if (search.length < 1) {
    return res.status(400).json({ message: "Please provide search term" })
  }

  try {
    const results = await Order.find({
      username: { $regex: `^${search}`, $options: "i" } // 👈 regex starts with `search`
    })

    res.status(200).json(results)
  } catch (error) {
    console.error("Order search failed:", error)
    res.status(500).json({ message: "Something went wrong" })
  }
}


const placeOrder = async (req, res) => {
  let orderId = await generateUniqueOrderId();

  try {
    const { orderItems, shippingInfo, paymentMethod, totalCost } = req.body;
    console.log("Order items:", orderItems);

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingInfo || !paymentMethod) {
      return res.status(400).json({ message: 'Missing shipping info or payment method' });
    }


    const finalItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      

      finalItems.push({
        product: product._id,
        name: product.name,
        qty: item.quantity,
        price: product.price, 
        image: product.images[0]?.url || ""

      });
    }

    const order = new Order({
      orderId,
      user: req.user,
      orderItems: finalItems,
      shippingInfo,
      paymentMethod,
      totalPrice:totalCost,
      isPaid: paymentMethod !== 'COD',
      paidAt: paymentMethod !== 'COD' ? new Date() : null
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder
    });

  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = { getAllOrders, searchOrdersByUsername, placeOrder, getOrderById };