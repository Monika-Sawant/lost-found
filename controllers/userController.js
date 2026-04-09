const User = require("../models/User");

// Get leaderboard
// Returns top 5 users sorted by score descending
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ score: -1 })
      .limit(5)
      .select("name description email score"); // return more info for ranking

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
