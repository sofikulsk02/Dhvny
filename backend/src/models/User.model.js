import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, "Display name cannot exceed 50 characters"],
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      maxlength: [200, "Website URL cannot exceed 200 characters"],
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    coverImageUrl: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isLegend: {
      type: Boolean,
      default: false,
    },
    settings: {
      privacy: {
        whoCanSendRequests: {
          type: String,
          enum: ["everyone", "friends-of-friends", "no-one"],
          default: "everyone",
        },
        showLikedSongs: { type: Boolean, default: true },
        showPlaylists: { type: Boolean, default: true },
      },
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        friendRequests: { type: Boolean, default: true },
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
      },
      playback: {
        audioQuality: {
          type: String,
          enum: ["low", "normal", "high"],
          default: "high",
        },
        autoplay: { type: Boolean, default: true },
        crossfade: { type: Boolean, default: false },
        crossfadeDuration: { type: Number, default: 5, min: 1, max: 12 },
      },
      appearance: {
        theme: {
          type: String,
          enum: ["light", "dark", "auto"],
          default: "light",
        },
        accentColor: {
          type: String,
          enum: [
            "purple",
            "blue",
            "pink",
            "green",
            "orange",
            "red",
            "yellow",
            "indigo",
          ],
          default: "purple",
        },
      },
    },
    role: {
      type: String,
      enum: ["user", "artist", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    playlists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
