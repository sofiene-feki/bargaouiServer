const Pack = require("../models/pack"); // ✅ CommonJS require
const slugify = require("slugify"); // npm i slugify

exports.createPack = async (req, res) => {
  try {
    const { title, description, price, category, products } = req.body;

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
      category,
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

// controllers/packController.js

exports.getPacksByCategory = async (req, res) => {
  try {
    const {
      category,
      page = 0,
      itemsPerPage = 10,
      sort = "-createdAt",
    } = req.body;

    // Pagination
    const skip = page * itemsPerPage;

    // Query packs by category
    const packs = await Pack.find({ category })
      .populate("products") // populate product details
      .sort(sort)
      .skip(skip)
      .limit(itemsPerPage);

    const totalPacks = await Pack.countDocuments({ category });

    res.status(200).json({
      packs,
      totalPacks,
      totalPages: Math.ceil(totalPacks / itemsPerPage),
    });
  } catch (err) {
    console.error("❌ Error fetching packs by category:", err);
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
    const { title, description, price, category } = req.body;

    // Parse products if it’s stringified
    let products = req.body.products;
    if (typeof products === "string") {
      try {
        products = JSON.parse(products);
      } catch (e) {
        return res.status(400).json({ error: "Invalid products format" });
      }
    }

    const media =
      req.files?.mediaFiles?.map((f) => ({
        src: `/uploads/media/${f.filename}`,
        type: f.mimetype.startsWith("image") ? "image" : "video",
        alt: f.originalname,
      })) || [];

    const pack = await Pack.findOneAndUpdate(
      { slug: req.params.slug },
      {
        title,
        description,
        category,
        price,
        products, // now it's a real array of ObjectIds
        ...(media.length > 0 && { $push: { media: { $each: media } } }),
      },
      { new: true }
    ).populate("products");

    if (!pack) return res.status(404).json({ error: "Pack not found" });

    res.json({ message: "Pack updated successfully", pack });
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
