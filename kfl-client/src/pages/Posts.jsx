import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from '../contexts/AuthContext';
import axios from "axios";
import TopBar from "../components/TopBar";
import ReactionUsersModal from "../components/ReactionUsersModal";
import MentionModal from "../components/MentionModal";
import {
  getFirstName,
  capitalizeFirstLetter,
  formatNameMaxTwoWords,
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
  const [votingOptionId, setVotingOptionId] = useState(null);
  const [activeReactionPost, setActiveReactionPost] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadPostsCount, setUnreadPostsCount] = useState(0);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState({ emoji: '', type: '', users: [], allUsers: [], position: null, postId: null, isMobileView: false });
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({}); // Track which posts are expanded
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Mention feature states
  const [allUsers, setAllUsers] = useState([]);
  const [showMentionModal, setShowMentionModal] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionModalPosition, setMentionModalPosition] = useState({ top: 0, left: 0 });
  const textInputRef = useRef(null);

  // New refs for click outside detection
  const dropdownRef = useRef(null);
  const reactionButtonsRef = useRef(null);
  const mentionModalRef = useRef(null);
  const loaderRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchPosts(true);
    fetchUnreadPostsCount();
    fetchAllUsers();
  }, []);

  // Separate useEffect for event listeners to avoid unnecessary re-renders
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close anything if clicking on reaction modal
      if (event.target.closest('[data-reaction-modal]')) {
        return;
      }

      // Handle closing mention modal
      if (mentionModalRef.current && !mentionModalRef.current.contains(event.target)) {
        setShowMentionModal(false);
      }
      
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

    const handleScroll = (e) => {
      // Clear long press timer on scroll
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      
      // Check scroll position - use the target that's actually scrolling
      let scrollTop = 0;
      if (e.target === document) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      } else if (e.target.scrollTop !== undefined) {
        scrollTop = e.target.scrollTop;
      }
      
      // Show floating button after scrolling down 300px
      if (scrollTop > 300) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    // Listen for scroll on both window and document with capture to catch all scroll events
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("scroll", handleScroll, true);
    
    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeReactionPost, activeDropdownId, longPressTimer]);

  useEffect(() => {
  }, [allUsers]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const token = localStorage.getItem('token');
      
      const postsRes = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: nextPage, limit: 10, markAsRead: true }
      });
      
      setPosts(prev => [...prev, ...postsRes.data.posts]);
      setCurrentPage(nextPage);
      setHasMore(postsRes.data.pagination.hasNextPage);
      setLoadingMore(false);
    } catch (error) {
      setLoadingMore(false);
      console.error("Error loading more posts:", error);
    }
  }, [loadingMore, hasMore, currentPage, API_URL]);

  // Infinite scroll observer
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMore, loadingMore, loading, loadMorePosts]);

  const fetchPosts = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setCurrentPage(1);
      }
      
      const token = localStorage.getItem('token');
      
      const postsRes = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: isInitial ? 1 : currentPage, limit: 10, markAsRead: true }
      });
      
      if (isInitial) {
        setPosts(postsRes.data.posts);
      } else {
        setPosts(prev => [...prev, ...postsRes.data.posts]);
      }
      
      setHasMore(postsRes.data.pagination.hasNextPage);
      setLoading(false);
      
      // Reset unread count
      if (isInitial) {
        setUnreadPostsCount(0);
        
        // Update other components
        window.dispatchEvent(new CustomEvent('unreadPostsUpdate', { 
          detail: { count: 0 } 
        }));
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching posts:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const url = `${API_URL}/auth/allUsers`;
      const token = localStorage.getItem('token');
      
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle both array and object responses
      let users = [];
      if (Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data && typeof response.data === 'object') {
        users = response.data.users || [];
      }
      
      setAllUsers(users);
    } catch (error) {
      console.error("Error data:", error.response?.data);
      setAllUsers([]);
    }
  };

  const handleMentionInput = (e) => {
    const value = e.target.value;
    setNewPostContent(value);

    // Get the textarea element and its properties
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    
    // Get text from last @ symbol to current cursor position
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Check if @ is preceded by a space or at the start (avoid matching email addresses)
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        const searchQuery = textBeforeCursor.substring(lastAtIndex + 1);
        
        // Show modal if @ is just typed or there's no space after it
        if (!searchQuery.includes(' ')) {
          setMentionSearchQuery(searchQuery);
          
          // Filter users based on search query (show all if query is empty)
          let filtered = allUsers;
          if (searchQuery.length > 0) {
            filtered = allUsers.filter(user =>
              user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setFilteredUsers(filtered);
          
          // Calculate modal position relative to the textarea
          const rect = textarea.getBoundingClientRect();
          const containerRect = textarea.parentElement.getBoundingClientRect();
          
          // Calculate line number where cursor is
          const lines = textBeforeCursor.split('\n').length - 1;
          const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
          const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop) || 12;
          
          const top = paddingTop + (lines * lineHeight) + 30;
          const left = 12;
          
          setMentionModalPosition({ top, left });
          setShowMentionModal(true);
        } else {
          setShowMentionModal(false);
        }
      } else {
        setShowMentionModal(false);
      }
    } else {
      setShowMentionModal(false);
    }
  };

  const handleSelectMentionedUser = (user) => {
    const value = newPostContent;
    const textarea = textInputRef.current;
    const cursorPos = textarea?.selectionStart || value.length;

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Replace from @ to cursor with @username
      const beforeAt = value.substring(0, lastAtIndex);
      const afterCursor = value.substring(cursorPos);
      const newContent = `${beforeAt}@${user.name} ${afterCursor}`;
      
      setNewPostContent(newContent);
      setShowMentionModal(false);
      
      // Restore focus and set cursor position after the mention
      if (textarea) {
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = beforeAt.length + user.name.length + 2; // @username + space
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  const handleCreatePost = async () => {
    try {
      setError("");
      if (!newPostContent.trim()) {
        setError("Post content cannot be empty");
        return;
      }
      
      setIsSubmittingPost(true);
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
          setIsSubmittingPost(false);
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
      // Refresh posts from the beginning
      setCurrentPage(1);
      setPosts([]);
      fetchPosts(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleUpdatePost = async () => {
    try {
      setError("");
      if (!editContent.trim()) {
        setError("Post content cannot be empty");
        return;
      }
      
      setIsSubmittingPost(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/posts/${editingPost._id}`, {
        content: editContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset edit mode and fetch updated posts
      setEditingPost(null);
      setEditContent("");
      // Refresh posts from the beginning
      setCurrentPage(1);
      setPosts([]);
      fetchPosts(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update post");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh posts after deletion
      setCurrentPage(1);
      setPosts([]);
      fetchPosts(true);
      // Close dropdown after action
      setActiveDropdownId(null);
    } catch (error) {
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
                reactionsByType: response.data.reactionsByType,
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
      setVotingOptionId(optionId);
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
      
      setVotingOptionId(null);
    } catch (error) {
      console.error("Error voting on poll:", error);
      setVotingOptionId(null);
      setError(error.response?.data?.message || "Failed to vote on poll");
      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  };

  const CHARACTER_LIMIT = 300;

  const isPostLong = (content) => {
    return content && content.length > CHARACTER_LIMIT;
  };

  const getTruncatedContent = (content) => {
    if (isPostLong(content)) {
      return content.substring(0, CHARACTER_LIMIT) + '...';
    }
    return content;
  };

  const togglePostExpansion = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleEmojiClick = (e, type, emoji, post) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Check if this is a desktop click (not a touch event) by checking if it's a mouse event
    const isDesktopClick = e.pointerType === 'mouse' || (!e.pointerType && e.type === 'click');
    
    if (isDesktopClick) {
      // Desktop: toggle the reaction (add if not reacted, remove if already reacted)
      handleReact(post._id, type);
    } else {
      // Touch/mobile: show the modal with who reacted
      const rect = e.currentTarget.getBoundingClientRect();
      const users = post.reactionsByType && post.reactionsByType[type] 
        ? post.reactionsByType[type] 
        : [];
      
      // Get all users who reacted (for "All" tab)
      const allUsers = [];
      if (post.reactionsByType) {
        Object.values(post.reactionsByType).forEach(userList => {
          allUsers.push(...userList);
        });
      }
      
      // Calculate position - place below the emoji button
      const position = {
        x: Math.max(10, rect.left),
        y: rect.bottom + 10
      };
      
      setSelectedReaction({
        emoji,
        type,
        users,
        allUsers,
        position,
        postId: post._id,
        isMobileView: true
      });
      setShowReactionPopup(true);
    }
  };

  const handleEmojiHover = (e, type, emoji, post) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const users = post.reactionsByType && post.reactionsByType[type] 
      ? post.reactionsByType[type] 
      : [];
    
    // Get all users who reacted (for "All" tab)
    const allUsers = [];
    if (post.reactionsByType) {
      Object.values(post.reactionsByType).forEach(userList => {
        allUsers.push(...userList);
      });
    }
    
    setSelectedReaction({
      emoji,
      type,
      users,
      allUsers,
      position: {
        x: rect.left + (rect.width / 2) - 100, // Center the popup (200px width / 2)
        y: rect.top
      }
    });
    setShowReactionPopup(true);
  };

  const handleEmojiLeave = () => {
    setShowReactionPopup(false);
  };

  const handleEmojiTouchStart = (e, type, emoji, post) => {
    const timer = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      const users = post.reactionsByType && post.reactionsByType[type] 
        ? post.reactionsByType[type] 
        : [];
      
      const allUsers = [];
      if (post.reactionsByType) {
        Object.values(post.reactionsByType).forEach(userList => {
          allUsers.push(...userList);
        });
      }
      
      setSelectedReaction({
        emoji,
        type,
        users,
        allUsers,
        position: {
          x: rect.left + (rect.width / 2) - 100, // Center the popup (200px width / 2)
          y: rect.top
        }
      });
      setShowReactionPopup(true);
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  const handleEmojiTouchEnd = (e, type, emoji, post) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      
      // If popup didn't show (short tap), show the modal instead
      if (!showReactionPopup) {
        handleEmojiClick(e, type, emoji, post);
      }
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

  // Function to parse and render mentions with blue styling
  const renderContentWithMentions = (content) => {
    if (!content) return null;
    
    // Use regex to find and replace mentions
    const mentionRegex = /@([A-Za-z\s]+?)(?=\s[^A-Za-z]|$|\s@|\s[a-z])/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Add the mention
      parts.push(
        <span key={match.index} className="text-blue-600 font-semibold">
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last mention
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : content;
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
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-visible">
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

                <div className="relative overflow-visible">
                  <textarea
                    ref={textInputRef}
                    value={newPostContent}
                    onChange={handleMentionInput}
                    placeholder="What's on your mind? Use @ to tag others"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                  />

                  {/* Mention Modal */}
                  <div ref={mentionModalRef} className="overflow-visible">
                    <MentionModal
                      users={filteredUsers}
                      onSelectUser={handleSelectMentionedUser}
                      isOpen={showMentionModal}
                      position={mentionModalPosition}
                      searchQuery={mentionSearchQuery}
                    />
                  </div>
                </div>

                {/* Poll toggle */}
                <div className="flex items-center mb-4 mt-4">
                  <input
                    type="checkbox"
                    id="isPoll"
                    checked={isCreatingPoll}
                    onChange={() => setIsCreatingPoll(!isCreatingPoll)}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isPoll" className="text-gray-700 cursor-pointer">
                    Create a poll
                  </label>
                </div>

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
                    disabled={isSubmittingPost}
                    className="min-w-[100px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmittingPost ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Publish"
                    )}
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
                    disabled={isSubmittingPost}
                    className="min-w-[130px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmittingPost ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Save Changes"
                    )}
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
                  className="text-sm bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible hover:shadow-md transition-shadow duration-200 relative"
                >
                  {/* Post Header */}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                          {post.author?.name
                            ? getCapitalizedInitial(
                                getFirstName(post.author.name),
                              )
                            : "?"}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-bold text-gray-900">
                              {post.author?.name
                                ? formatNameMaxTwoWords(post.author.name)
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
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                              {expandedPosts[post._id] 
                                ? renderContentWithMentions(post.content)
                                : renderContentWithMentions(getTruncatedContent(post.content))
                              }
                            </div>
                            {isPostLong(post.content) && (
                              <button
                                onClick={() => togglePostExpansion(post._id)}
                                className="text-blue-400 hover:text-blue-500 font-semibold text-sm mt-2 transition-colors"
                              >
                                {expandedPosts[post._id] ? 'Read Less' : 'Read More'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Post Actions Dropdown (Edit/Delete) */}
                      <div className="relative post-actions-dropdown">
                        {(currentUser?.isAdmin || 
                          (post.author._id === currentUser?._id && isPostEditable(post))) && (
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
                            className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
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
                      <div className="px-4 pb-2">
                        <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                          <div className="space-y-1.5">
                            {post.pollOptions.map((option) => {
                              // Calculate percentage for this option
                              const totalVotes = post.pollOptions.reduce(
                                (sum, opt) => sum + (opt.voteCount || 0),
                                0,
                              );
                              const votePercentage =
                                totalVotes > 0
                                  ? Math.round(
                                      ((option.voteCount || 0) / totalVotes) *
                                        100,
                                    )
                                  : 0;

                              // Check if user has voted for this option
                              const hasUserVoted = post.userVote === option._id;
                              const isVoting = votingOptionId === option._id;

                              return (
                                <div key={option._id} className="relative">
                                  {/* Container with relative positioning */}
                                  <div className="relative w-full overflow-hidden rounded-md">
                                    {/* Progress bar - absolute positioning with correct width */}
                                    <div
                                      className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                                        hasUserVoted ? 'bg-blue-200' : 'bg-blue-100'
                                      }`}
                                      style={{
                                        width: `${votePercentage}%`,
                                        zIndex: 0,
                                      }}
                                    />

                                    {/* Option button - position relative to appear above progress bar */}
                                    <button
                                      onClick={() => {
                                        if (!post.userVote && !votingOptionId) {
                                          handleVote(post._id, option._id);
                                        }
                                      }}
                                      disabled={post.userVote !== null && post.userVote !== undefined || votingOptionId !== null}
                                      className={`w-full text-left p-2 border rounded-md transition-all duration-300 relative z-10 text-sm
                                      ${
                                        hasUserVoted
                                          ? "bg-transparent border-blue-400 border-2 font-medium shadow-sm"
                                          : isVoting
                                          ? "bg-blue-50 border-blue-300 cursor-wait"
                                          : post.userVote
                                          ? "bg-transparent cursor-not-allowed opacity-75"
                                          : "hover:bg-gray-100 bg-transparent cursor-pointer hover:border-gray-400"
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                          {isVoting ? (
                                            <svg className="animate-spin h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                          ) : hasUserVoted ? (
                                            <span className="text-blue-600 text-xs font-bold">✓</span>
                                          ) : null}
                                          <span className={hasUserVoted ? "text-blue-800" : ""}>{option.text}</span>
                                        </div>
                                        <span className={`font-medium text-xs ${hasUserVoted ? "text-blue-700" : "text-blue-600"}`}>
                                          {votePercentage}%
                                        </span>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              {post.pollOptions.reduce(
                                (sum, opt) => sum + (opt.voteCount || 0),
                                0,
                              )}{" "}
                              votes
                            </p>
                            <p className="text-[10px] mt-0.5 italic">
                              {post.userVote 
                                ? <span className="text-green-600 font-medium">✓ You have voted on this poll</span>
                                : <span className="text-gray-400">ℹ️ You can vote only once and cannot change your vote</span>
                              }
                            </p>
                          </div>
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
                              <button
                                key={type}
                                onClick={(e) => handleEmojiClick(e, type, emoji, post)}
                                onMouseEnter={(e) => handleEmojiHover(e, type, emoji, post)}
                                onMouseLeave={handleEmojiLeave}
                                onTouchStart={(e) => handleEmojiTouchStart(e, type, emoji, post)}
                                onTouchEnd={(e) => handleEmojiTouchEnd(e, type, emoji, post)}
                                className="flex items-center text-gray-500 text-xs hover:bg-gray-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                <span className="mr-1">{emoji}</span>
                                <span>{post.reactionCounts[type]}</span>
                              </button>
                            )
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setActiveReactionPost(
                            activeReactionPost === post._id ? null : post._id,
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

            {/* Infinite Scroll Loader */}
            <div ref={loaderRef} className="flex justify-center items-center py-6">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Loading more posts...</span>
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-gray-500 text-sm">No more posts to load</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Buttons */}
      {showFloatingButton && (
        <div className="fixed bottom-20 right-6 md:right-16 md:bottom-24 flex flex-col gap-3 z-50">
          {/* Scroll to Top Button */}
          <button
            onClick={() => {
              // Scroll both window and the scrolling container to top
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // Find and scroll the main content container
              const mainContainer = document.querySelector('main.overflow-auto');
              if (mainContainer) {
                mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="bg-white hover:bg-gray-100 text-indigo-600 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-gray-200"
            aria-label="Scroll to Top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>

          {/* Create Post Button */}
          {!showCreatePost && (
            <button
              onClick={() => {
                setShowCreatePost(true);
                // Scroll both window and the scrolling container to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Find and scroll the main content container
                const mainContainer = document.querySelector('main.overflow-auto');
                if (mainContainer) {
                  mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              aria-label="Create Post"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Reaction Users Popup */}
      <ReactionUsersModal 
        isOpen={showReactionPopup}
        onClose={() => setShowReactionPopup(false)}
        emoji={selectedReaction.emoji}
        position={selectedReaction.position}
        users={selectedReaction.users}
        allUsers={selectedReaction.allUsers}
        currentUserId={currentUser?._id}
        reactionType={selectedReaction.type}
        postId={selectedReaction.postId}
        onRemoveReaction={handleReact}
        isMobileView={selectedReaction.isMobileView}
      />
    </>
  );
};

export default Posts;
