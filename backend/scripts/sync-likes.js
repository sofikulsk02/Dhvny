// Script to sync existing likes to user.likedSongs array
import mongoose from "mongoose";
import dotenv from "dotenv";
import Song from "../src/models/Song.model.js";
import User from "../src/models/User.model.js";

dotenv.config();

const syncLikes = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/dhvny"
    );
    console.log("✅ Connected to MongoDB");

    console.log("\n🔍 Finding all songs with likes...");
    const songs = await Song.find({
      likedBy: { $exists: true, $ne: [] },
    }).lean();
    console.log(`📦 Found ${songs.length} songs with likes`);

    let totalSynced = 0;
    let updates = 0;

    for (const song of songs) {
      console.log(`\n📝 Processing song: ${song.title} (${song._id})`);
      console.log(`   👥 Liked by ${song.likedBy.length} users`);

      for (const userId of song.likedBy) {
        try {
          const result = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { likedSongs: song._id } },
            { new: true }
          );

          if (result) {
            totalSynced++;
            console.log(`   ✅ Added to user ${userId}'s liked songs`);
          } else {
            console.log(`   ⚠️  User ${userId} not found`);
          }
        } catch (error) {
          console.error(`   ❌ Error updating user ${userId}:`, error.message);
        }
      }
      updates++;
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 SYNC COMPLETE!");
    console.log("=".repeat(50));
    console.log(`✅ Processed ${updates} songs`);
    console.log(`✅ Synced ${totalSynced} user-song relationships`);
    console.log("=".repeat(50) + "\n");

    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

syncLikes();
