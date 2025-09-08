const mongoose = require("mongoose");

const storySlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: "Title is required",
      minlength: [2, "Too short"],
      maxlength: [100, "Too long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long"],
    },
    cta: {
      type: String,
      trim: true,
      maxlength: [50, "CTA too long"],
    },
    link: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: "Video is required",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StorySlide", storySlideSchema);
