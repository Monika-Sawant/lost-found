const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    details: {
      type: [String],
    },
    category: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resolverName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
