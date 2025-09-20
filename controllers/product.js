const Product = require("../models/product");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// helper to delete old files
const deleteFile = async (filePath) => {
  try {
    if (filePath)
      await fs.promises.unlink(path.join(__dirname, "..", filePath));
  } catch (err) {
    console.error("Error deleting file:", filePath, err.message);
  }
};

// CREATE PRODUCT
exports.create = async (req, res) => {
  try {
    const { body, files } = req;

    // 1️⃣ Parse JSON strings into objects if necessary
    ["colors", "sizes", "ficheTech"].forEach((key) => {
      if (body[key] && typeof body[key] === "string") {
        try {
          body[key] = JSON.parse(body[key]);
        } catch (err) {
          console.error(`Failed to parse ${key}:`, err);
          body[key] = []; // default empty array if parsing fails
        }
      }
    });

    // 2️⃣ Ensure numbers are cast properly
    body.Price = Number(body.Price) || 0;
    body.Promotion = Number(body.Promotion) || 0;
    body.Quantity = Number(body.Quantity) || 0;
    body.sold = Number(body.sold) || 0;

    // 3️⃣ Ensure sizes.price is a number
    if (Array.isArray(body.sizes)) {
      body.sizes = body.sizes.map((s) => ({
        ...s,
        price: Number(s.price) || 0,
      }));
    }

    // 4️⃣ Handle media files
    const media = [];
    if (files?.mediaFiles) {
      files.mediaFiles.forEach((f) => {
        media.push({
          src: `/uploads/media/${f.filename}`,
          type: f.mimetype.startsWith("image") ? "image" : "video",
          alt: f.originalname,
        });
      });
    }

    // 5️⃣ Handle color files if you upload them separately
    if (files?.colorFiles) {
      body.colors.forEach((color, i) => {
        if (files.colorFiles[i]) {
          color.src = `/uploads/media/${files.colorFiles[i].filename}`;
        }
      });
    }
    // 6️⃣ Create the product
    const newProduct = new Product({
      ...body,
      slug: slugify(body.Title),
      media,
    });

    const saved = await newProduct.save();
    res.json(saved);
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(400).json({ error: err.message });
  }
};

// READ PRODUCT
exports.read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PRODUCT
exports.update = async (req, res) => {
  try {
    const { body, files } = req;
    console.log("👉 Update hit:", req.params.slug);
    console.log("📦 Received files:", files);
    console.log("📦 Received body (raw):", body);

    const existing = await Product.findOne({ slug: req.params.slug });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    // -------------------------
    // Parse JSON fields safely
    // -------------------------
    const parseJSONSafely = (value, key) => {
      if (!value) return [];
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          console.log(`✅ Parsed ${key}:`, parsed);
          return parsed;
        } catch (err) {
          console.warn(`⚠️ Failed to parse ${key}, got raw string:`, value);
          return [];
        }
      }
      return value; // already object/array
    };

    body.colors = parseJSONSafely(body.colors, "colors");
    body.sizes = parseJSONSafely(body.sizes, "sizes");
    body.existingMediaIds = parseJSONSafely(
      body.existingMediaIds,
      "existingMediaIds"
    );

    // Convert size prices to numbers
    if (Array.isArray(body.sizes)) {
      body.sizes = body.sizes.map((s) => ({
        ...s,
        price: Number(s.price) || 0,
      }));
    }

    // -------------------------
    // Handle colors update with files
    // -------------------------
    if (Array.isArray(body.colors)) {
      body.colors.forEach((color, i) => {
        // If file uploaded for this color, update src
        if (files?.colorFiles && files.colorFiles[i]) {
          color.src = `/uploads/media/${files.colorFiles[i].filename}`;
        } else if (color._id) {
          // If color existed before and no new file uploaded, preserve its existing src
          const oldColor = existing.colors.find(
            (c) => c._id.toString() === color._id
          );
          if (oldColor) color.src = oldColor.src;
        }
      });
    }

    // -------------------------
    // Handle media (images & videos)
    // -------------------------
    let updatedMedia = (existing.media || []).filter((m) =>
      body.existingMediaIds.includes(m._id.toString())
    );

    const mediaToDelete = (existing.media || []).filter(
      (m) => !body.existingMediaIds.includes(m._id.toString())
    );

    // Delete removed media files from disk
    for (let m of mediaToDelete) {
      if (m.src) {
        console.log("🗑️ Deleting media file:", m.src);
        await deleteFile(m.src); // Implement deleteFile function
      }
    }

    // Append newly uploaded media
    if (files?.mediaFiles) {
      const newMedia = files.mediaFiles.map((f) => ({
        src: `/uploads/media/${f.filename}`,
        type: f.mimetype.startsWith("image") ? "image" : "video",
        alt: f.originalname,
      }));
      updatedMedia.push(...newMedia);
    }

    body.media = updatedMedia;
    console.log("✅ Final media array to save:", updatedMedia);

    // If title changed, update slug
    if (body.Title) body.slug = slugify(body.Title);

    // -------------------------
    // Update in DB
    // -------------------------
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      body,
      { new: true, runValidators: true }
    );

    console.log("✅ Product successfully updated:", updated);
    res.json(updated);
  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE PRODUCT
exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Deleted successfully", product: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LIST PRODUCTS with filters/pagination
exports.list = async (req, res) => {
  try {
    console.log("📥 Request body:", req.body); // <-- log incoming payload

    let { page = 0, itemsPerPage = 12, filters = {}, sort = "new" } = req.body;

    // Parse safely
    page = parseInt(page);
    itemsPerPage = parseInt(itemsPerPage);

    if (isNaN(page) || page < 0) page = 0; // allow 0-based
    if (isNaN(itemsPerPage) || itemsPerPage < 1) itemsPerPage = 12;

    const skip = page * itemsPerPage;

    const sortCriteria = (() => {
      switch (sort) {
        case "best":
          return { sold: -1 };
        case "Price: Low to High":
          return { Price: 1 };
        case "Price: High to Low":
          return { Price: -1 };
        case "new":
        default:
          return { createdAt: -1 };
      }
    })();

    const appliedFilters = filters.selected || filters;
    const query = {};

    Object.keys(appliedFilters).forEach((key) => {
      const value = appliedFilters[key];
      if (Array.isArray(value) && value.length) {
        if (key === "priceRange" && value.length === 2) {
          query.Price = { $gte: value[0], $lte: value[1] };
        } else {
          const fieldMap = {
            category: "Category",
            color: "colors.value",
            brand: "Brand",
            size: "size",
          };
          const dbField = fieldMap[key] || key;
          query[dbField] = { $in: value };
        }
      }
    });

    const products = await Product.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(itemsPerPage);
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / itemsPerPage);

    res.json({ products, totalPages, total, currentPage: page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/category/:Category
// GET /api/products/category/:category
// controllers/productController.js

exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryParam = req.params.category?.trim();
    if (!categoryParam) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Case-insensitive regex to match the DB Category field
    const filter = {
      Category: { $regex: `^${categoryParam}$`, $options: "i" },
    };

    console.log("Filter used:", filter);

    // Fetch all matching products
    const products = await Product.find(filter);

    console.log(`Products found for "${categoryParam}":`, products.length);

    res.json({
      products,
      total: products.length,
    });
  } catch (err) {
    console.error("❌ Error fetching products by category:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.getNewArrivals = async (req, res) => {
  const { filter } = req.params; // ✅ extract category from params

  try {
    const query =
      filter && filter !== "all"
        ? { Category: filter } // match only the given category
        : {}; // if no category or "all", return from all categories

    // Fetch latest 4 products in this category
    const products = await Product.find(query)
      .sort({ updatedAt: -1 }) // newest first
      .limit(4);

    res.json({ products });
  } catch (err) {
    console.error("❌ Error fetching new arrivals:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    // Fetch latest 5 products
    const products = await Product.find({})
      .sort({ sold: -1 }) // newest first
      .limit(4);

    res.json({ products });
  } catch (err) {
    console.error("❌ Error fetching new arrivals:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Search products by title or description
exports.search = async (req, res) => {
  try {
    const { query = "", page = 0, itemsPerPage = 12 } = req.body;

    // Parse numbers safely
    const currentPage = parseInt(page) || 0;
    const limit = parseInt(itemsPerPage) || 12;
    const skip = currentPage * limit;

    // Regex search, case-insensitive
    const searchRegex = new RegExp(query, "i");

    const filter = {
      $or: [
        { Title: searchRegex },
        { Description: searchRegex },
        { slug: searchRegex },
      ],
    };

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({ products, total, totalPages, currentPage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/productController.js
exports.getAllProductTitles = async (req, res) => {
  try {
    const products = await Product.find({}, "Title slug sizes colors");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Get single product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product by slug:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Set product of the year
exports.setProductOfTheYear = async (req, res) => {
  try {
    const { slug } = req.params;

    // reset previous product of the year
    await Product.updateMany(
      { isProductOfTheYear: true },
      { $set: { isProductOfTheYear: false } }
    );

    // set the new one
    const product = await Product.findOneAndUpdate(
      { slug },
      { $set: { isProductOfTheYear: true } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    console.error("❌ Error setting product of the year:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get product of the year
exports.getProductOfTheYear = async (req, res) => {
  try {
    const product = await Product.findOne({ isProductOfTheYear: true });

    if (!product) {
      return res.status(404).json({ message: "No product of the year found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
