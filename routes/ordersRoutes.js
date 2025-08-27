const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getAllOrders,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/orders");

// ✅ Routes
router.post("/order/create", createOrder);
router.get("/order/:id", getOrderById);
router.get("/orders", getAllOrders);
router.delete("/order/:id", deleteOrder);
router.put("/order/:id/status", updateOrderStatus);

// ✅ Debug routes
console.log("✅ Orders router loaded with routes:");
router.stack.forEach((r) => {
  if (r.route) {
    console.log(Object.keys(r.route.methods), r.route.path);
  }
});

module.exports = router;
