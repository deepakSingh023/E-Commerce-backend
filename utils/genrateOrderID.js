const Order = require("../models/orders");

const generateUniqueOrderId = async () => {
  let unique = false;
  let orderId = "";

  while (!unique) {
    const datePart = new Date().toISOString().slice(0, 10).split("-").reverse().join(""); // DDMMYYYY
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    orderId = `ORD-${datePart}-${randomPart}`;

    const existing = await Order.findOne({ orderId });
    if (!existing) unique = true; // If no duplicate found, exit loop
  }

  return orderId;
};

module.exports = generateUniqueOrderId;
