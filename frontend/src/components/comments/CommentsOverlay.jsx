// src/components/comments/CommentsOverlay.jsx
import React, { useEffect, useRef, useState } from "react";
import commentsApi from "../../api/comments.api";

/**
 * CommentsOverlay - improved with like/reply and optimistic UI
 */
export default function CommentsOverlay({
  visible = false,
  onClose = () => {},
  song = null,
}) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, userName }
  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible || !song) return;

    const loadComments = async () => {
      try {
        const response = await commentsApi.getComments(
          song._id || song.songId || song.id
        );
        const fetchedComments = (response.comments || []).map((c) => ({
          id: c._id,
          user: c.user?.displayName || c.user?.username || "Anonymous",
          text: c.content,
          likes: c.likesCount || 0,
          liked: c.liked || false,
          ts: new Date(c.createdAt).getTime(),
          replies: (c.replies || []).map((r) => ({
            id: r._id,
            user: r.user?.displayName || r.user?.username || "Anonymous",
            text: r.content,
            likes: r.likesCount || 0,
            liked: r.liked || false,
            ts: new Date(r.createdAt).getTime(),
          })),
        }));
        setComments(fetchedComments);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };

    loadComments();
  }, [visible, song]);

  useEffect(() => {
    if (visible) inputRef.current?.focus?.();
  }, [visible]);

  if (!visible) return null;

  async function postComment(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || !song) return;

    const optimistic = {
      id: `tmp_${Date.now()}`,
      user: "You",
      text,
      likes: 0,
      ts: Date.now(),
      optimistic: true,
      replies: [],
    };

    // If replying to a comment, add as nested reply
    if (replyingTo) {
      setComments((s) =>
        s.map((c) =>
          c.id === replyingTo.commentId
            ? { ...c, replies: [...(c.replies || []), optimistic] }
            : c
        )
      );
    } else {
      // Top-level comment
      setComments((s) => [optimistic, ...s]);
    }
    setInput("");

    try {
      const response = await commentsApi.createComment(
        song._id || song.songId || song.id,
        text,
        replyingTo?.commentId // parentComment for replies
      );
      const created = {
        id: response.comment._id,
        user: response.comment.user?.displayName || "You",
        text: response.comment.content,
        likes: response.comment.likesCount || 0,
        liked: false,
        ts: new Date(response.comment.createdAt).getTime(),
        replies: [],
      };

      if (replyingTo) {
        // Replace optimistic reply with real one
        setComments((s) =>
          s.map((c) =>
            c.id === replyingTo.commentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === optimistic.id ? created : r
                  ),
                }
              : c
          )
        );
        setReplyingTo(null);
      } else {
        // Replace optimistic top-level comment
        setComments((s) =>
          s.map((c) => (c.id === optimistic.id ? created : c))
        );
      }
    } catch (err) {
      // Rollback
      if (replyingTo) {
        setComments((s) =>
          s.map((c) =>
            c.id === replyingTo.commentId
              ? {
                  ...c,
                  replies: c.replies.filter((r) => r.id !== optimistic.id),
                }
              : c
          )
        );
      } else {
        setComments((s) => s.filter((c) => c.id !== optimistic.id));
      }
      console.error("comment post failed", err);
      alert("Could not post comment");
    }
  }

  async function toggleLikeComment(
    commentId,
    isReply = false,
    parentId = null
  ) {
    if (isReply && parentId) {
      // Like a reply
      setComments((s) =>
        s.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? {
                        ...r,
                        likes: r.liked ? r.likes - 1 : r.likes + 1,
                        liked: !r.liked,
                      }
                    : r
                ),
              }
            : c
        )
      );
    } else {
      // Like a top-level comment
      setComments((s) =>
        s.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: c.liked ? c.likes - 1 : c.likes + 1,
                liked: !c.liked,
              }
            : c
        )
      );
    }
    try {
      await commentsApi.toggleCommentLike(commentId);
    } catch (err) {
      console.warn("toggle comment like failed", err);
    }
  }

  function handleReply(commentId, userName) {
    setReplyingTo({ commentId, userName });
    inputRef.current?.focus?.();
  }

  function handleShare(comment) {
    const shareUrl = `${window.location.origin}/song/${
      song._id || song.songId || song.id
    }?comment=${comment.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Comment by ${comment.user}`,
          text: comment.text,
          url: shareUrl,
        })
        .catch(() => {
          // fallback to copy
          navigator.clipboard.writeText(shareUrl);
          alert("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Comment link copied to clipboard!");
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-t-3xl p-4 max-h-[70vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Comments</div>
            <div className="text-lg font-semibold truncate">{song?.title}</div>
          </div>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        <form onSubmit={postComment} className="mb-3">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.userName}...`
                  : "Write a comment... (@ to mention)"
              }
              className="flex-1 border rounded px-3 py-2"
            />
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Send
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.length === 0 && (
            <div className="text-sm text-gray-500">No comments yet.</div>
          )}
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded ${
                c.optimistic ? "bg-gray-50" : "bg-white"
              } shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{c.user}</div>
                <div className="text-xs text-gray-400">{timeAgo(c.ts)}</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{c.text}</div>
              <div className="mt-2 flex items-center space-x-3">
                <button
                  onClick={() => toggleLikeComment(c.id)}
                  className={`text-xs flex items-center gap-1 ${
                    c.liked ? "text-red-500 font-medium" : "text-gray-500"
                  }`}
                >
                  <span className={c.liked ? "text-red-500" : ""}>♥</span>{" "}
                  {c.likes}
                </button>
                <button
                  onClick={() => handleReply(c.id, c.user)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Reply
                </button>
                <button
                  onClick={() => handleShare(c)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Share
                </button>
              </div>

              {/* Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                  {c.replies.map((r) => (
                    <div
                      key={r.id}
                      className={`p-2 rounded ${
                        r.optimistic ? "bg-gray-50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium">{r.user}</div>
                        <div className="text-xs text-gray-400">
                          {timeAgo(r.ts)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 mt-1">{r.text}</div>
                      <div className="mt-1 flex items-center space-x-2">
                        <button
                          onClick={() => toggleLikeComment(r.id, true, c.id)}
                          className={`text-xs flex items-center gap-1 ${
                            r.liked
                              ? "text-red-500 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          <span className={r.liked ? "text-red-500" : ""}>
                            ♥
                          </span>{" "}
                          {r.likes}
                        </button>
                        <button
                          onClick={() => handleReply(c.id, r.user)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => handleShare(r)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts) {
  const diff = Date.now() - (ts || 0);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
