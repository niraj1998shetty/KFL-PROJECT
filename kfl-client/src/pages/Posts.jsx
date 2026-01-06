import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";
import TopBar from "../components/TopBar";
import {
  getFirstName,
  capitalizeFirstLetter,
  getCapitalizedInitial,
} from "../helpers/functions";

// Emoji mapping for reactions
const reactionEmojis = {
  like: "❤️",
  fire: "🔥",
  thumbsUp: "👍",
  dislike: "👎",
  sad: "🥲",
  cry: "😭",
  hardLaugh: "🤣",
  highFive: "🙌"
};

const Posts = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [error, setError] = useState("");
  const [activeReactionPost, setActiveReactionPost] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadPostsCount, setUnreadPostsCount] = useState(0);

  

  // New refs for click outside detection
  const dropdownRef = useRef(null);
  const reactionButtonsRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchPosts();
    fetchUnreadPostsCount();
  }, []);

  // Separate useEffect for event listeners to avoid unnecessary re-renders
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle closing emoji picker
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      
      // Handle closing reaction buttons
      if (
        activeReactionPost && 
        reactionButtonsRef.current && 
        !reactionButtonsRef.current.contains(event.target) &&
        // Make sure we're not closing when clicking the 'React' button itself
        !event.target.closest('[data-reaction-trigger]')
      ) {
        setActiveReactionPost(null);
      }
      
      // Handle closing dropdown menu
      if (
        activeDropdownId && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        // Ensure we're not closing when clicking the dropdown toggle itself
        !event.target.closest('[data-dropdown-toggle]')
      ) {
        setActiveDropdownId(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeReactionPost, activeDropdownId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const postsRes = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: postsPerPage, markAsRead: true }
      });
      
      setPosts(postsRes.data.posts);
      setTotalPosts(postsRes.data.pagination.total);
      setTotalPages(postsRes.data.pagination.totalPages);
      setLoading(false);
      
      // Reset unread count
      setUnreadPostsCount(0);
      
      // Update other components
      window.dispatchEvent(new CustomEvent('unreadPostsUpdate', { 
        detail: { count: 0 } 
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };
    
    useEffect(() => {
      fetchPosts();
    }, [currentPage, postsPerPage]);

    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
      }
    };

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

  const handleCreatePost = async () => {
    try {
      setError("");
      if (!newPostContent.trim()) {
        setError("Post content cannot be empty");
        return;
      }
      
      const token = localStorage.getItem('token');
      const postData = {
        content: newPostContent,
        isPoll: isCreatingPoll
      };
      
      if (isCreatingPoll) {
        // Filter out empty poll options
        const validOptions = pollOptions.filter(opt => opt.trim() !== "");
        if (validOptions.length < 2) {
          setError("Please provide at least 2 options for the poll");
          return;
        }
        postData.pollOptions = validOptions;
      }
      
      await axios.post(`${API_URL}/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and fetch updated posts
      setNewPostContent("");
      setIsCreatingPoll(false);
      setPollOptions(["", ""]);
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.response?.data?.message || "Failed to create post");
    }
  };

  const handleUpdatePost = async () => {
    try {
      setError("");
      if (!editContent.trim()) {
        setError("Post content cannot be empty");
        return;
      }
      
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/posts/${editingPost._id}`, {
        content: editContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset edit mode and fetch updated posts
      setEditingPost(null);
      setEditContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      setError(error.response?.data?.message || "Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh posts after deletion
      fetchPosts();
      // Close dropdown after action
      setActiveDropdownId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      setError(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleReact = async (postId, reactionType) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/posts/${postId}/react`, {
        type: reactionType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update just the reactions for this post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? {
                ...post,
                reactionCounts: response.data.reactionCounts,
                userReactions: response.data.userReactions
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error reacting to post:", error);
    }
  };

  const handleVote = async (postId, optionId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/posts/${postId}/vote`, {
        optionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update poll results for this post
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            // Create a deep copy to ensure state update is detected
            const updatedPost = {...post};
            
            // Update the vote counts based on API response
            updatedPost.pollOptions = updatedPost.pollOptions.map(option => {
              const updatedOption = response.data.pollResults.find(
                result => result._id === option._id
              );
              
              return {
                ...option,
                voteCount: updatedOption ? updatedOption.voteCount : 0
              };
            });
            
            // Record user's vote
            updatedPost.userVote = optionId;
            
            return updatedPost;
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    // Close dropdown after action
    setActiveDropdownId(null);
  };
  

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const fetchUnreadPostsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/posts/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadPostsCount(response.data.count);
      
      // Also dispatch an event so other components can update
      window.dispatchEvent(new CustomEvent('unreadPostsUpdate', { 
        detail: { count: response.data.count } 
      }));
    } catch (error) {
      console.error("Error fetching unread posts count:", error);
    }
  };

  // Improved formatTimestamp to handle timezone consistently
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fixed function to check if post is editable
  const isPostEditable = (post) => {
    // Check if current user is the author
    const isAuthor = post.author._id === currentUser?._id;
    
    // Check if post is within 30-minute edit window
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const timeDifference = new Date() - new Date(post.createdAt);
    const isWithinEditWindow = timeDifference <= thirtyMinutesInMs;
    
    return isAuthor && isWithinEditWindow;
  };

    // Fixed function to check if post has been meaningfully edited
    

//   const isPostEdited = (post) => {
//     // If createdAt and updatedAt are the same, it hasn't been edited
//     if (post.createdAt === post.updatedAt) return false;
    
//     // Check if there's a meaningful time difference (at least 1 second)
//     const createdTime = new Date(post.createdAt).getTime();
//     const updatedTime = new Date(post.updatedAt).getTime();
//     return (updatedTime - createdTime) >= 1000; // 1 second difference threshold
//   };

  // Toggle dropdown menu for post actions
  const toggleDropdown = (postId) => {
    setActiveDropdownId(activeDropdownId === postId ? null : postId);
  };

  return (
    <>
      <TopBar />

      <main className="flex-grow bg-gray-100 py-4">
        <div className="max-w-3xl mx-auto px-4">
          {/* Create Post Button */}
          {!showCreatePost && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Post
              </button>
            </div>
          )}

          {/* Create Post Form */}
          {showCreatePost && (
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">
                  Create Post
                </h2>
              </div>

              <div className="p-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind? Use @ to tag others"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                />

                {/* Poll toggle */}
                {/* <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isPoll"
                    checked={isCreatingPoll}
                    onChange={() => setIsCreatingPoll(!isCreatingPoll)}
                    className="mr-2"
                  />
                  <label htmlFor="isPoll" className="text-gray-700">
                    Create a poll
                  </label>
                </div> */}

                {/* Poll options */}
                {isCreatingPoll && (
                  <div className="mb-4 space-y-3">
                    <h3 className="font-medium text-gray-700">Poll Options:</h3>
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updatePollOption(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="flex-grow p-2 border border-gray-300 rounded-md"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() => removePollOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addPollOption}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Option
                    </button>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPostContent("");
                      setIsCreatingPoll(false);
                      setPollOptions(["", ""]);
                      setError("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Post Form */}
          {editingPost && (
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Post
                </h2>
                <span className="text-xs text-gray-500">
                  edit within 30 minutes
                </span>
              </div>

              <div className="p-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                />

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setEditContent("");
                      setError("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePost}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="text-sm bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative"
                >
                  {/* Post Header */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                          {post.author?.name
                            ? getCapitalizedInitial(
                                getFirstName(post.author.name)
                              )
                            : "?"}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-bold text-gray-900">
                              {post.author?.name
                                ? capitalizeFirstLetter(
                                    getFirstName(post.author.name)
                                  )
                                : "Unknown User"}
                            </h3>
                            <span className="mx-1 text-gray-400">·</span>
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(post.createdAt)}
                              {/* {isPostEdited(post) && (
                                <span className="ml-1 text-gray-400">(edited)</span>
                              )} */}
                            </p>
                          </div>

                          {/* Post Content */}
                          <div className="mt-2">
                            <div className="text-gray-800 leading-relaxed">
                              {post.content}
                            </div>

                            {/* Tagged Users */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag._id}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
                                  >
                                    @{tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Post Actions Dropdown (Edit/Delete) */}
                      <div className="relative post-actions-dropdown">
                        {(post.author._id === currentUser?._id ||
                          currentUser?.isAdmin) && (
                          <button
                            onClick={() => toggleDropdown(post._id)}
                            data-dropdown-toggle={true}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            aria-label="Post options"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        )}
                        {activeDropdownId === post._id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                          >
                            <div className="py-1">
                              {isPostEditable(post) && (
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>
                              )}
                              {currentUser?.isAdmin && (
                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Poll Content */}
                  {post.isPoll &&
                    post.pollOptions &&
                    post.pollOptions.length > 0 && (
                      <div className="px-4 pb-3">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-3">
                            Poll
                          </h4>
                          <div className="space-y-2">
                            {post.pollOptions.map((option) => {
                              // Calculate percentage for this option
                              const totalVotes = post.pollOptions.reduce(
                                (sum, opt) => sum + (opt.voteCount || 0),
                                0
                              );
                              const votePercentage =
                                totalVotes > 0
                                  ? Math.round(
                                      ((option.voteCount || 0) / totalVotes) *
                                        100
                                    )
                                  : 0;

                              // Check if user has voted for this option
                              const hasUserVoted = post.userVote === option._id;

                              return (
                                <div key={option._id} className="relative">
                                  {/* Container with relative positioning */}
                                  <div className="relative w-full overflow-hidden rounded-md">
                                    {/* Progress bar - absolute positioning with correct width */}
                                    <div
                                      className="absolute top-0 left-0 h-full bg-blue-100"
                                      style={{
                                        width: `${votePercentage}%`,
                                        zIndex: 0,
                                      }}
                                    />

                                    {/* Option button - position relative to appear above progress bar */}
                                    <button
                                      onClick={() =>
                                        handleVote(post._id, option._id)
                                      }
                                      className={`w-full text-left p-2.5 border rounded-md transition-colors relative z-10
                                      ${
                                        hasUserVoted
                                          ? "bg-blue-50 border-blue-300"
                                          : "hover:bg-gray-100 bg-transparent"
                                      }`}
                                    >
                                      <div className="flex justify-between">
                                        <span>{option.text}</span>
                                        <span className="text-blue-600 font-medium">
                                          {votePercentage}%
                                        </span>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {post.pollOptions.reduce(
                              (sum, opt) => sum + (opt.voteCount || 0),
                              0
                            )}{" "}
                            votes
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Reactions Summary */}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-1.5">
                        {Object.entries(reactionEmojis).map(
                          ([type, emoji]) =>
                            post.reactionCounts[type] > 0 && (
                              <div
                                key={type}
                                className="flex items-center text-gray-500 text-xs"
                              >
                                <span className="mr-1">{emoji}</span>
                                <span>{post.reactionCounts[type]}</span>
                              </div>
                            )
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setActiveReactionPost(
                            activeReactionPost === post._id ? null : post._id
                          )
                        }
                        data-reaction-trigger={true}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        React
                      </button>
                    </div>
                  </div>

                  {/* Floating Reaction Buttons */}
                  {activeReactionPost === post._id && (
                    <div
                      ref={reactionButtonsRef}
                      className="absolute z-20 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex space-x-1 reaction-container"
                      style={{
                        bottom: "45px", // Position above the reactions summary bar
                        right: "16px", // Align with the right side of post
                      }}
                    >
                      {Object.entries(reactionEmojis).map(([type, emoji]) => (
                        <button
                          key={type}
                          onClick={() => {
                            handleReact(post._id, type);
                            setActiveReactionPost(null);
                          }}
                          className={`flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                            post.userReactions[type]
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                          aria-label={type}
                        >
                          <span className="text-sm">{emoji}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show current page, first, last, and pages close to current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there are gaps
                      const showEllipsisBefore =
                        index > 0 && array[index - 1] !== page - 1;
                      const showEllipsisAfter =
                        index < array.length - 1 &&
                        array[index + 1] !== page + 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-3 py-1 text-gray-500">...</span>
                          )}

                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                              page === currentPage
                                ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {page}
                          </button>

                          {showEllipsisAfter && (
                            <span className="px-3 py-1 text-gray-500">...</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Posts;