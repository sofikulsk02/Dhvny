import mongoose from "mongoose";

const jamSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      default: null,
    },
    queue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    isPlaying: {
      type: Boolean,
      default: false,
    },
    currentPosition: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxParticipants: {
      type: Number,
      default: 10,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active sessions
jamSessionSchema.index({ isActive: 1, createdAt: -1 });
jamSessionSchema.index({ host: 1 });

const JamSession = mongoose.model("JamSession", jamSessionSchema);

export default JamSession;
