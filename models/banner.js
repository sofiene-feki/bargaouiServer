const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String },
    img: { type: String }, // stored file path
    file: { type: String }, // raw filename if needed
    preview: { type: String }, // optional preview url
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
