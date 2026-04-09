/**
 * Run this once to clean up old items whose userId no longer exists in Users collection.
 * Usage: node cleanup-orphan-items.js
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostfound';

async function cleanup() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const itemsColl = mongoose.connection.db.collection('items');
  const usersColl = mongoose.connection.db.collection('users');

  const items = await itemsColl.find({}).toArray();
  let deleted = 0;

  for (const item of items) {
    const userId = item.userId;
    if (!userId) {
      await itemsColl.deleteOne({ _id: item._id });
      deleted++;
      console.log(`Deleted item with no userId: ${item.title}`);
      continue;
    }

    // Check if using ObjectId format
    let oid;
    try {
      oid = new mongoose.Types.ObjectId(userId.toString());
    } catch(e) {
      await itemsColl.deleteOne({ _id: item._id });
      deleted++;
      console.log(`Deleted item with invalid userId: ${item.title}`);
      continue;
    }

    const user = await usersColl.findOne({ _id: oid });
    if (!user) {
      await itemsColl.deleteOne({ _id: item._id });
      deleted++;
      console.log(`Deleted orphan item: ${item.title} (userId=${userId})`);
    } else {
      console.log(`✓ Item OK: ${item.title} -> User: ${user.name} <${user.email}>`);
    }
  }

  console.log(`\nCleanup complete. Deleted ${deleted} orphan items.`);
  process.exit(0);
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
