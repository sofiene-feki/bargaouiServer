const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createStorySlide,
  getStorySlides,
  getStorySlide,
  updateStorySlide,
  deleteStorySlide,
} = require("../controllers/storySlide");

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/media/video"); // store all videos here
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// --- Routes ---
router.post(
  "/story-slide/create",
  upload.single("video"), // only one video per slide
  createStorySlide
);

router.get("/story-slides", getStorySlides); // list all
router.get("/story-slide/:id", getStorySlide); // get single
router.put(
  "/story-slide/:id",
  upload.single("video"), // allow updating video too
  updateStorySlide
);
router.delete("/story-slide/:id", deleteStorySlide);

module.exports = router;
