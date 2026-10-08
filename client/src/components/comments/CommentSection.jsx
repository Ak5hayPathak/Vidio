import { useEffect, useState } from "react";

import Comment from "./Comment.jsx";
import { addComment, getVideoComments } from "./comment.service.js";

import { useAuth } from "../../context/AuthContext.jsx";

function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [sortType, setSortType] = useState("desc");

  const [error, setError] = useState("");

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getVideoComments(videoId, {
        page: 1,
        limit: 10,
        sortType,
      });

      setComments(data.docs || []);
    } catch (error) {
      // Backend currently returns 404 when there are no comments.
      if (error.response?.status === 404) {
        setComments([]);
        return;
      }

      console.error("Failed to fetch comments:", error);

      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!videoId) return;

    fetchComments();
  }, [videoId, sortType]);

  const handleSubmit = async () => {
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);

      const newComment = await addComment(videoId, commentText.trim());

      setComments((prev) => [newComment, ...prev]);

      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === updatedComment._id
          ? {
              ...comment,
              ...updatedComment,
            }
          : comment,
      ),
    );
  };

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Comments</h2>

          <span className="text-sm text-gray-500">{comments.length}</span>
        </div>

        {/* Sort */}
        {/* <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="
            rounded-lg border border-white/10
            bg-[#111318]
            px-3 py-2
            text-sm text-gray-300
            outline-none
            focus:border-red-600/50
          "
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select> */}
      </div>

      {/* Comment input */}
      <div className="mt-5 flex gap-3">
        <div
          className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-full bg-red-600
          text-sm font-semibold
        "
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-gray-300">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            rows={2}
            className="
              w-full resize-none rounded-xl
              border border-white/10
              bg-[#111318]
              px-4 py-3
              text-sm text-white
              outline-none
              placeholder:text-gray-600
              focus:border-red-600/50
            "
          />

          {commentText.trim() && (
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setCommentText("")}
                className="
                  rounded-lg px-4 py-2
                  text-sm text-gray-400
                  transition hover:bg-white/5
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="
                  rounded-lg bg-red-600
                  px-4 py-2
                  text-sm font-medium text-white
                  transition hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {submitting ? "Commenting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <p className="mt-5 text-sm text-red-500">{error}</p>}

      {/* Loading */}
      {loading ? (
        <div className="mt-8 text-sm text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="mt-8 text-sm text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onDeleted={handleCommentDeleted}
              onUpdated={handleCommentUpdated}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CommentSection;
