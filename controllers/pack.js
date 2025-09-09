const Pack = require("../models/pack"); // ✅ CommonJS require
const slugify = require("slugify"); // npm i slugify

exports.createPack = async (req, res) => {
  try {
    const { title, description, price, products } = req.body;

    if (!title || !price || !products || products.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Parse products if sent as string
    const productIds =
      typeof products === "string" ? JSON.parse(products) : products;

    // Handle media files
    const media = [];
    if (req.files?.mediaFiles) {
      req.files.mediaFiles.forEach((f) => {
        media.push({
          src: `/uploads/media/${f.filename}`,
          type: f.mimetype.startsWith("image") ? "image" : "video",
          alt: f.originalname,
        });
      });
    }

    // Create the slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Create the pack
    const pack = new Pack({
      title,
      slug,
      description,
      price,
      products: productIds,
      media,
    });

    await pack.save();

    // Populate products before sending response
    await pack.populate("products");

    res.status(201).json({
      message: "Pack created successfully",
      pack,
    });
  } catch (err) {
    console.error("❌ Error creating pack:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ALL
exports.getPacks = async (req, res) => {
  try {
    const packs = await Pack.find().populate("products");
    res.status(200).json(packs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ READ ONE
exports.getPack = async (req, res) => {
  try {
    const pack = await Pack.findOne({ slug: req.params.slug }).populate(
      "products"
    );
    if (!pack) return res.status(404).json({ error: "Pack not found" });

    res.json(pack);
  } catch (err) {
    console.error("❌ Error fetching pack:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ UPDATE
exports.updatePack = async (req, res) => {
  try {
    const { title, description, price, products } = req.body;

    // collect media files (append if provided)
    const media = req.files?.mediaFiles?.map((f) => f.path) || [];

    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        products,
        ...(media.length > 0 && { $push: { media: { $each: media } } }),
      },
      { new: true }
    ).populate("products");

    if (!pack) return res.status(404).json({ error: "Pack not found" });

    res.json({
      message: "Pack updated successfully",
      pack,
    });
  } catch (err) {
    console.error("❌ Error updating pack:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ DELETE
exports.deletePack = async (req, res) => {
  try {
    const pack = await Pack.findByIdAndDelete(req.params.id);
    if (!pack) return res.status(404).json({ error: "Pack not found" });

    res.json({ message: "Pack deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting pack:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
