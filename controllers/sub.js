const Sub = require("../models/sub");
const slugify = require("slugify");
const Product = require("../models/product");
const Category = require("../models/category");

// CREATE
exports.create = async (req, res) => {
  try {
    const { sub } = req.body;
    const { sub: subName, parent } = sub;

    if (!subName || !parent)
      return res.status(400).send("Sub name and parent category are required");

    const newSub = await new Sub({
      name: subName,
      parent,
      slug: slugify(subName),
    }).save();

    res.json(newSub);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

// LIST
exports.list = async (req, res) => {
  try {
    const { parent } = req.query;
    const filter = parent ? { parent } : {};
    const subs = await Sub.find(filter).populate("parent", "name").exec();
    res.json(subs);
  } catch (err) {
    console.log(err);
    res.status(400).send("Failed to fetch subcategories");
  }
};

// READ
exports.read = async (req, res) => {
  try {
    let sub = await Sub.findOne({ slug: req.params.slug }).exec();
    if (!sub) return res.status(404).send("Subcategory not found");

    const products = await Product.find({ subs: sub })
      .populate("category")
      .exec();

    res.json({ sub, products });
  } catch (err) {
    console.log(err);
    res.status(400).send("Failed to fetch subcategory");
  }
};

// UPDATE
exports.update = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const update = await Sub.findOneAndUpdate(
      { slug: req.params.slug },
      { name, parent, slug: slugify(name) },
      { new: true }
    );
    res.json(update);
  } catch (err) {
    console.log(err);
    res.status(400).send("Sub update failed");
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const deleted = await Sub.findByIdAndDelete(req.params.id); // Use ID instead of slug
    if (!deleted) return res.status(404).send("Subcategory not found");
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).send("Sub delete failed");
  }
};
