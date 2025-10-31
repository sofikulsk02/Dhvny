import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "like", // Someone liked your song
        "comment", // Someone commented on your song
        "comment_reply", // Someone replied to your comment
        "comment_like", // Someone liked your comment
        "friend_request", // Someone sent you a friend request
        "friend_accept", // Someone accepted your friend request
        "friend_reject", // Someone rejected your friend request
        "jam_invite", // Someone invited you to a jam session
        "jam_request", // Someone requested to join your jam
        "legend_promotion", // Song promoted to Legend (global)
        "new_song", // Someone you follow uploaded a new song
        "playlist_share", // Someone shared a playlist with you
        "playlist_collab", // Someone added you as playlist collaborator
        "song_share", // Someone shared a song with you
        "mention", // Someone mentioned you
      ],
    },
    content: {
      type: String,
      required: true,
    },
    relatedSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
    relatedPlaylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    relatedJamSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JamSession",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
