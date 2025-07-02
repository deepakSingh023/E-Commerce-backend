const Order = require('../models/orders');


const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;

    // 1. Validate input
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping address and payment method are required' });
    }

    // 2. Calculate total price
    let totalPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      totalPrice += product.price * item.qty;
    }

    // 3. Create order
    const order = new Order({
      user: req.user.userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: paymentMethod === 'COD' ? false : true, // Assume COD not paid, others paid
      paidAt: paymentMethod === 'COD' ? null : new Date()
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

module.exports = { getAllOrders, searchOrdersByUsername, placeOrder };