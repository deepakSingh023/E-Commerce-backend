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
        qty: item.quantity,
        price: product.price
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



module.exports = { getAllOrders, searchOrdersByUsername, placeOrder };