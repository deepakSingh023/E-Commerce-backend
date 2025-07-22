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
    const { orderItems, shippingInfo, paymentMethod, totalCost, userInfo } = req.body;
    
    console.log("Order items:", orderItems);
    console.log("User info:", userInfo);
    
    // Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }
    
    if (!shippingInfo || !paymentMethod) {
      return res.status(400).json({ message: 'Missing shipping info or payment method' });
    }
    
    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ message: 'User email is required' });
    }
    
    if (!totalCost || totalCost <= 0) {
      return res.status(400).json({ message: 'Invalid total cost' });
    }
    
    const finalItems = [];
    
    // Process each order item
    for (const item of orderItems) {
      // Backend expects 'id' field (fixed from looking for 'product')
      if (!item.id) {
        return res.status(400).json({ message: 'Product ID is required for each item' });
      }
      
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.id}` });
      }
      
      // Validate quantity
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product: ${product.name}` });
      }
      
      // Check stock availability (optional)
      if (product.stock !== undefined && product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
      
      finalItems.push({
        product: product._id,
        name: product.name,
        qty: item.quantity,
        price: product.price,
        image: product.images[0]?.url || "",
        size: item.size || null  // Include size if provided
      });
    }
    
    // Verify total cost matches calculated total
    const calculatedTotal = finalItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (Math.abs(calculatedTotal - totalCost) > 0.01) { // Allow for small rounding differences
      return res.status(400).json({ 
        message: `Total cost mismatch. Calculated: ${calculatedTotal}, Provided: ${totalCost}` 
      });
    }
    
    // Create the order
    const order = new Order({
      orderId,
      user: req.user, // Assuming user is attached to req from auth middleware
      orderItems: finalItems,
      shippingInfo: {
        firstname: shippingInfo.firstname,
        lastname: shippingInfo.lastname,
        address: shippingInfo.address,
        city: shippingInfo.city,
        zip: shippingInfo.zip,
        state: shippingInfo.state,
        phone: shippingInfo.phone
      },
      paymentMethod,
      totalPrice: totalCost,
      isPaid: paymentMethod !== 'COD',
      paidAt: paymentMethod !== 'COD' ? new Date() : null,
      // Store user email
      userEmail: userInfo.email
    });
    
    const savedOrder = await order.save();
    
    // Optionally update product stock
    for (const item of finalItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.qty } }, // Decrease stock
        { new: true }
      );
    }
    
    // Return success response with order details
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        _id: savedOrder._id,
        orderId: savedOrder.orderId,
        totalPrice: savedOrder.totalPrice,
        status: savedOrder.status || 'pending',
        createdAt: savedOrder.createdAt
      }
    });
    
  } catch (err) {
    console.error('Order placement error:', err);
    
    // Handle different types of errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: errors 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid product ID format' 
      });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
};



module.exports = { getAllOrders, searchOrdersByUsername, placeOrder, getOrderById };