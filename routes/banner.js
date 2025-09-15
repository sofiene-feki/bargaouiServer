const express = require("express");
const multer = require("multer");
const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require("../controllers/banner");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/media");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// CRUD routes
router.delete("/remove/banner/:id", remove);
router.post("/create/banner", upload.single("file"), create);
router.get("/banners", getAll);
router.get("/banner/:id", getOne);
router.put("/update/banner/:id", upload.single("file"), update);

module.exports = router;
