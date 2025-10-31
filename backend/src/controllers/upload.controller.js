import Song from "../models/Song.model.js";
import Friendship from "../models/Friendship.model.js";
import {
  uploadAudioToCloudinary,
  uploadImageToCloudinary,
  isCloudinaryConfigured,
} from "../utils/cloudinary.utils.js";
import {
  createNotification,
  emitNotification,
} from "./notifications.controller.js";
import fs from "fs";
import path from "path";

/**
 * @route   POST /api/upload/song
 * @desc    Upload a new song with audio file and optional cover image
 * @access  Private
 * @body    { title, artist, album?, duration, tags?, genre?, lyrics? }
 * @files   audio (required), cover (optional)
 */
export const uploadSong = async (req, res) => {
  try {
    const { title, artist, album, duration, tags, genre, lyrics, releaseDate } =
      req.body;

    // Validate required fields
    if (!title || !artist || !duration) {
      // Clean up uploaded files
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }
      return res.status(400).json({
        success: false,
        message: "Title, artist, and duration are required",
      });
    }

    // Check if audio file is uploaded
    if (!req.files || !req.files.audio || req.files.audio.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    let audioUrl = "";
    let coverUrl = "";
    let audioDuration = parseFloat(duration) || 0;
    let fileSize = audioFile.size;
    let format = path.extname(audioFile.originalname).slice(1);

    // Upload to Cloudinary if configured, otherwise use local storage
    if (isCloudinaryConfigured()) {
      try {
        // Upload audio
        console.log("Uploading audio to Cloudinary...");
        const audioResult = await uploadAudioToCloudinary(audioFile.path);
        audioUrl = audioResult.url;
        audioDuration = audioResult.duration || audioDuration;
        fileSize = audioResult.bytes;
        format = audioResult.format;

        // Upload cover if provided
        if (coverFile) {
          console.log("Uploading cover to Cloudinary...");
          const coverResult = await uploadImageToCloudinary(coverFile.path);
          coverUrl = coverResult.url;
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload files to cloud storage",
          error: cloudinaryError.message,
        });
      }
    } else {
      // Use local storage URLs
      audioUrl = `/uploads/audio/${audioFile.filename}`;
      if (coverFile) {
        coverUrl = `/uploads/images/${coverFile.filename}`;
      }
    }

    // Parse tags if provided as JSON string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === "string" ? tags.split(",") : [];
      }
    }

    // Create song document
    const song = new Song({
      title,
      artist,
      album: album || "",
      duration: audioDuration,
      audioUrl,
      coverUrl,
      lyrics: lyrics || "",
      tags: parsedTags,
      genre: genre || "",
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      uploadedBy: req.user._id,
      fileSize,
      format,
      isPublic: true,
      isApproved: true,
    });

    await song.save();

    // Populate uploadedBy field
    await song.populate("uploadedBy", "displayName username avatar");

    // Get all friends to notify them
    const friendships = await Friendship.find({
      $or: [
        { requester: req.user._id, status: "accepted" },
        { recipient: req.user._id, status: "accepted" },
      ],
    });

    // Extract friend IDs
    const friendIds = friendships.map((friendship) => {
      return friendship.requester.toString() === req.user._id.toString()
        ? friendship.recipient
        : friendship.requester;
    });

    // Send notification to all friends
    if (friendIds.length > 0 && req.app.get("io")) {
      const notificationPromises = friendIds.map(async (friendId) => {
        const notification = await createNotification({
          recipient: friendId,
          sender: req.user._id,
          type: "new_song",
          content: `${req.user.displayName} uploaded a new song: "${song.title}"`,
          relatedSong: song._id,
          link: `/songs/${song._id}`,
        });
        emitNotification(req.app.get("io"), friendId, notification);
      });

      await Promise.all(notificationPromises);
    }

    res.status(201).json({
      success: true,
      message: "Song uploaded successfully",
      song: {
        songId: song.songId,
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl,
        tags: song.tags,
        genre: song.genre,
        uploadedBy: song.uploadedBy,
        isLegend: song.isLegend,
        likesCount: song.likesCount,
        playsCount: song.playsCount,
        createdAt: song.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload song error:", error);

    // Clean up files on error
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload song",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar image
 * @access  Private
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    let avatarUrl = "";

    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadImageToCloudinary(
          req.file.path,
          "dhvny/avatars"
        );
        avatarUrl = result.url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar to cloud storage",
          error: cloudinaryError.message,
        });
      }
    } else {
      avatarUrl = `/uploads/images/${req.file.filename}`;
    }

    // Update user avatar
    req.user.avatar = avatarUrl;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};
