// const { submitForm } = require("../controllers/formController");

import express from "express";
import Category from "../models/Category.js";
import findOrCreateCategory from "../utils/saveCategoryTree.js";
const router = express.Router();

// -------------------------------------------------
// functions to be used
// Recursively populate category tree
const populateCategoryTree = async (categoryId) => {
  const category = await Category.findById(categoryId).lean();
  if (!category) return null;

  const children = await Promise.all(
    category.items.map(async (id) => await populateCategoryTree(id))
  );

  category.items = children.filter((c) => c !== null);

  return category;
};


// Recursively delete a category and all descendants
const deleteCategoryAndChildren = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) return;
  for (const childId of category.items) {
    await deleteCategoryAndChildren(childId);
  }
  await Category.findByIdAndDelete(categoryId);
};

// ------------------------------------------------

// Get tree of all top-level categories
router.get("/tree", async (req, res) => {
  try {
    const all = await Category.find();
    const referenced = new Set();
    all.forEach((cat) =>
      cat.items.forEach((id) => referenced.add(id.toString()))
    );
    const topLevel = all.filter((cat) => !referenced.has(cat._id.toString()));

    const tree = await Promise.all(
      topLevel.map((cat) => populateCategoryTree(cat._id))
    );
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: "Failed to build category tree" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "Data must be a non-empty array." });
    }

    const savedCategories = [];

    for (const category of data) {
      const saved = await findOrCreateCategory(category);
      savedCategories.push(saved);
    }

    res.status(201).json(savedCategories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete route
router.delete("/:id", async (req, res) => {
  try {
    await deleteCategoryAndChildren(req.params.id);
    res.status(200).json({ message: "Category and descendants deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
