const StorySlide = require("../models/story");

// ✅ Create a new slide
exports.createStorySlide = async (req, res) => {
  try {
    const { title, description, cta, link } = req.body;

    const videoUrl = req.file ? req.file.path : null;

    if (!videoUrl) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const slide = new StorySlide({
      title,
      description,
      cta,
      link,
      videoUrl,
    });

    await slide.save();
    res.json(slide);
  } catch (err) {
    console.error("❌ Error creating slide:", err);
    res.status(500).json({ error: "Failed to create slide" });
  }
};

// ✅ Get all slides
exports.getStorySlides = async (req, res) => {
  try {
    const slides = await StorySlide.find().sort({ createdAt: -1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch slides" });
  }
};

// ✅ Get single slide by ID
exports.getStorySlide = async (req, res) => {
  try {
    const slide = await StorySlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: "Slide not found" });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch slide" });
  }
};

// ✅ Update slide
exports.updateStorySlide = async (req, res) => {
  try {
    const { title, description, cta, link } = req.body;

    let updateData = { title, description, cta, link };

    if (req.file) {
      updateData.videoUrl = req.file.path;
    }

    const updatedSlide = await StorySlide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedSlide) {
      return res.status(404).json({ error: "Slide not found" });
    }

    res.json(updatedSlide);
  } catch (err) {
    res.status(500).json({ error: "Failed to update slide" });
  }
};

// ✅ Delete slide
exports.deleteStorySlide = async (req, res) => {
  try {
    const slide = await StorySlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ error: "Slide not found" });

    res.json({ message: "Slide deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete slide" });
  }
};
