const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const colorSchema = new mongoose.Schema({
  name: String,
  value: String,
  src: String,
  alt: String,
  type: String,
});

const mediaSchema = new mongoose.Schema({
  src: String,
  alt: String,
  type: String, // "image" | "video"
});

const productSchema = new mongoose.Schema(
  {
    Title: { type: String, required: true },
    slug: { type: String, unique: true },
    Description: String,
    Price: { type: Number, default: 0 },
    promotion: { type: Number, default: 0 }, // percentage
    Quantity: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isProductOfTheYear: { type: Boolean, default: false },
    Image: String,
    pdf: String,
    video: String,
    media: [mediaSchema],
    colors: [colorSchema],
    sizes: [sizeSchema],
    Category: String,
    subCategory: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
