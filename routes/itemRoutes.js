const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item-controllers");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, itemController.createItem);
router.get("/", itemController.getItems);
router.put("/:id/resolve", protect, itemController.resolveItem);
router.put("/:id", protect, itemController.updateItem);
router.delete("/:id", protect, itemController.deleteItem);

module.exports = router;
