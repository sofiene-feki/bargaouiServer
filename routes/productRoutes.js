const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  create,
  read,
  update,
  remove,
  list,
  getNewArrivals,
  search,
  getAllProductTitles,
  setProductOfTheYear,
  getProductBySlug,
  getProductOfTheYear,
  getBestSellers,
  getProductsByCategory,
} = require("../controllers/product");

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "uploads/others";
    if (file.fieldname === "mediaFiles") dir = "uploads/media";
    if (file.fieldname === "colorFiles") dir = "uploads/media";

    // else if (file.fieldname === "imageFile") dir = "uploads/images";
    // else if (file.fieldname === "pdf") dir = "uploads/pdfs";
    // else if (file.fieldname === "video") dir = "uploads/videos";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// routes

// 1️⃣ Category routes (static/dynamic)
router.get("/products/category/:category", getProductsByCategory);

// 2️⃣ Listing routes
router.post("/products", list);
router.get("/products/new-arrivals/:filter", getNewArrivals);
router.get("/products/best-sellers", getBestSellers);
router.post("/products/search", search);

// 3️⃣ Special product routes
router.put("/product/specialOffre/:slug", setProductOfTheYear);
router.get("/getProductOfTheYear", getProductOfTheYear);
router.get("/titles", getAllProductTitles);
router.get("/specialOffre/:slug", getProductBySlug);

// 4️⃣ CRUD operations
router.post(
  "/product/create",
  upload.fields([
    { name: "mediaFiles", maxCount: 20 },
    { name: "colorFiles", maxCount: 20 },
    { name: "imageFile", maxCount: 20 },
    { name: "pdf", maxCount: 20 },
    { name: "video", maxCount: 20 },
  ]),
  create
);

router.put(
  "/product/update/:slug",
  upload.fields([
    { name: "mediaFiles", maxCount: 20 },
    { name: "colorFiles", maxCount: 20 },
    { name: "imageFile", maxCount: 20 },
    { name: "pdf", maxCount: 20 },
    { name: "video", maxCount: 20 },
  ]),
  update
);

router.delete("/product/:slug", remove);

// 5️⃣ Generic read route (last!)
router.get("/product/:slug", read);

// LIST

console.log("✅ Product router loaded with routes:");
router.stack.forEach((r) => {
  if (r.route) {
    console.log(Object.keys(r.route.methods), r.route.path);
  }
});

module.exports = router;
