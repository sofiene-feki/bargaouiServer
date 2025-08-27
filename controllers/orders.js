const Order = require("../models/Order");

// ✅ Create Order
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, shipping, subtotal, total } =
      req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      customer,
      items,
      paymentMethod,
      shipping,
      subtotal,
      total,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    res.status(500).json({ message: error.message }); // ✅ Return only error.message
  }
};

// ✅ Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., "pending", "shipped", "delivered"

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
