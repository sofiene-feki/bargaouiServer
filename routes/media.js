const express = require("express");
const router = express.Router();
const { getAllMedia, deleteMedia } = require("../controllers/mediaController");

router.get("/media", getAllMedia);
router.delete("/media/:filename", deleteMedia);

module.exports = router;
