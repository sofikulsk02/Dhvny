import mongoose from "mongoose";

const jamSessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Jam session name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
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
        role: {
          type: String,
          enum: ["host", "moderator", "participant"],
          default: "participant",
        },
      },
    ],
    queue: [
      {
        song: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song",
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
    currentPosition: {
      type: Number,
      default: 0,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    maxParticipants: {
      type: Number,
      default: 50,
      max: 100,
    },
    status: {
      type: String,
      enum: ["active", "paused", "ended"],
      default: "active",
    },
    invitedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      allowAddSongs: {
        type: Boolean,
        default: true,
      },
      allowSkip: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: false,
      },
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index
jamSessionSchema.index({ host: 1, status: 1 });
jamSessionSchema.index({ "participants.user": 1 });
jamSessionSchema.index({ status: 1, isPublic: 1 });

const JamSession = mongoose.model("JamSession", jamSessionSchema);

export default JamSession;
