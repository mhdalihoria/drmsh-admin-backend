const FormModel = require("../models/Category");

exports.submitForm = async (req, res) => {
  try {
    const newDoc = new FormModel({ data: req.body.data });
    await newDoc.save();
    res.status(201).json({ message: "Form saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
};
