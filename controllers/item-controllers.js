const Item = require("../models/item");
const User = require("../models/User");

// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    const { title, description, details, category, location } = req.body;

    const item = await Item.create({
      title,
      description,
      details: details || [],
      category,
      location,
      userId: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET ALL ITEMS (with filter)
// Only gets "open" items. Filtering by category if provided.
exports.getItems = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { status: "open" };
    if (category) {
      filter.category = category;
    }

    const items = await Item.find(filter)
      .populate("userId", "name description email")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM (General update)
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

// RESOLVE ITEM
exports.resolveItem = async (req, res) => {
  try {
    const { resolverUserId, foundItemId } = req.body;

    if (!resolverUserId) {
      return res.status(400).json({ message: "Please select who resolved the item" });
    }

    // Find and validate the lost item
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.status === "resolved") {
      return res.status(400).json({ message: "Item is already resolved" });
    }

    // Find the finder user and increment their score
    const resolverUser = await User.findById(resolverUserId);
    if (!resolverUser) {
      return res.status(404).json({ message: "Finder (Resolver) not found" });
    }
    resolverUser.score += 1;
    await resolverUser.save();

    // Mark the lost item as resolved
    item.status = "resolved";
    item.resolverName = resolverUser.name;
    await item.save();

    // Also mark the corresponding found item as resolved (remove it from Found list)
    if (foundItemId) {
      const foundItem = await Item.findById(foundItemId);
      if (foundItem && foundItem.status === "open") {
        foundItem.status = "resolved";
        await foundItem.save();
      }
    }

    res.status(200).json({ message: "Item resolved successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

