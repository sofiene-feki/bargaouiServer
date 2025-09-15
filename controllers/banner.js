const Banner = require("../models/banner");

// CREATE
exports.create = async (req, res) => {
  try {
    const { title, link } = req.body;

    let imgPath = "";
    if (req.file) {
      imgPath = `/uploads/media/${req.file.filename}`;
    }

    const banner = new Banner({
      title,
      link,
      img: imgPath,
      file: req.file ? req.file.filename : null,
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL
exports.getAll = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ SINGLE
exports.getOne = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { title, link } = req.body;

    let updateData = { title, link };
    if (req.file) {
      updateData.img = `/uploads/media/${req.file.filename}`;
      updateData.file = req.file.filename;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBanner)
      return res.status(404).json({ message: "Banner not found" });

    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (!deletedBanner)
      return res.status(404).json({ message: "Banner not found" });

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
