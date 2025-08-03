// utils/saveCategoryTree.js
import Category from "../models/Category.js";

const findOrCreateCategory = async (category) => {
  // Step 1: Find existing category by name + img
  const existing = await Category.findOne({
    categoryName: category.categoryName,
    img: category.img,
  });

  if (existing) return existing;

  // Step 2: Recursively resolve children
  const children = [];

  if (Array.isArray(category.items)) {
    for (const child of category.items) {
      const savedChild = await findOrCreateCategory(child);

      // ✅ Prevent duplicates in the children array
      if (!children.some((id) => id.toString() === savedChild._id.toString())) {
        children.push(savedChild._id);
      }
    }
  }

  // Step 3: Save the parent with unique children
  const newCategory = new Category({
    categoryName: category.categoryName,
    img: category.img,
    items: children,
  });

  return await newCategory.save();
};


export default findOrCreateCategory
