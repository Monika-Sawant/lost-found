const Item = require("../models/Item");

// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET ALL ITEMS (with filter)
exports.getItems = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = category ? { category } : {};

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
