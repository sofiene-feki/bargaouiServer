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
router.post(
  "/product/create",
  upload.fields([
    { name: "mediaFiles", maxCount: 5 },
    { name: "colorFiles", maxCount: 5 },
    { name: "imageFile", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  create
);

// UPDATE (specific before slug)
router.put(
  "/product/update/:slug",
  upload.fields([
    { name: "mediaFiles", maxCount: 5 },
    { name: "imageFile", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  update
);
router.post("/products", list);
router.get("/products/new-arrivals", getNewArrivals);
router.get("/products/best-sellers", getBestSellers);
router.get("/category/:category", getProductsByCategory);

// DELETE
router.delete("/product/:slug", remove);

// READ (generic slug goes last!)
router.get("/product/:slug", read);
router.post("/products/search", search);

router.put("/product/specialOffre/:slug", setProductOfTheYear);
router.get("/getProductOfTheYear", getProductOfTheYear); // ✅ new route
router.get("/titles", getAllProductTitles);
router.get("/specialOffre/:slug", getProductBySlug);

// LIST

console.log("✅ Product router loaded with routes:");
router.stack.forEach((r) => {
  if (r.route) {
    console.log(Object.keys(r.route.methods), r.route.path);
  }
});

module.exports = router;
