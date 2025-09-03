const fs = require("fs");
const path = require("path");

exports.getAllMedia = async (req, res) => {
  try {
    const mediaPath = path.join(__dirname, "../uploads/media");

    const files = await fs.promises.readdir(mediaPath);

    const urls = files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/media/${file}`
    );

    res.json(urls);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename)
      return res.status(400).json({ message: "Filename is required" });

    const filePath = path.join(__dirname, "../uploads/media", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete the file
    await fs.promises.unlink(filePath);

    res.json({ message: "File deleted successfully", filename });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
