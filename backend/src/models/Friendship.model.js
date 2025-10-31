import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
    },
    // When the request was sent
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    // When the request was accepted/rejected
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate requests
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Index for querying by status
friendshipSchema.index({ status: 1 });

// Index for finding all relationships for a user
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

const Friendship = mongoose.model("Friendship", friendshipSchema);

export default Friendship;
