const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  createPack,
  getPacks,
  getPack,
  updatePack,
  deletePack,
  getPacksByCategory,
} = require("../controllers/pack");

// Multer storage (same as product setup)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "uploads/others";
    if (file.fieldname === "mediaFiles") dir = "uploads/media";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Routes
router.post(
  "/pack/create",
  upload.fields([{ name: "mediaFiles", maxCount: 20 }]),
  createPack
);

router.get("/packs", getPacks);
router.post("/pack/category", getPacksByCategory);

router.get("/pack/:slug", getPack);

router.put(
  "/pack/:slug",
  upload.fields([{ name: "mediaFiles", maxCount: 20 }]),
  updatePack
);

router.delete("/pack/:id", deletePack);

// ✅ Debug log

module.exports = router;
