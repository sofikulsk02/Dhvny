import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    songId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: [true, "Song title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    artist: {
      type: String,
      required: [true, "Artist name is required"],
      trim: true,
      maxlength: [200, "Artist name cannot exceed 200 characters"],
    },
    album: {
      type: String,
      trim: true,
      maxlength: [200, "Album name cannot exceed 200 characters"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [0, "Duration must be positive"],
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
    },
    coverUrl: {
      type: String,
      default: "",
    },
    lyrics: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    genre: {
      type: String,
      trim: true,
    },
    releaseDate: {
      type: Date,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isLegend: {
      type: Boolean,
      default: false,
    },
    legendPromotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    legendPromotionCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    playsCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    fileSize: {
      type: Number,
    },
    format: {
      type: String,
    },
    bitrate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique songId before saving
songSchema.pre("save", function (next) {
  if (!this.songId) {
    this.songId = `song_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

// Indexes for better query performance
songSchema.index({ title: "text", artist: "text", album: "text" });
songSchema.index({ uploadedBy: 1, createdAt: -1 });
songSchema.index({ isLegend: 1, legendPromotionCount: -1 });
songSchema.index({ likesCount: -1, playsCount: -1 });
songSchema.index({ tags: 1 });

const Song = mongoose.model("Song", songSchema);

export default Song;
