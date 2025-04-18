import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  capitalizeFirstLetter,
  getCapitalizedInitial,
} from "../helpers/functions";
import { 
  Home, 
  Trophy, 
  BarChart2, 
  MessageSquare, 
  Gift, 
  FileText, 
  Link as LinkIcon, 
  User, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Instagram
} from "lucide-react";

const Sidebar = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [showOtherLinks, setShowOtherLinks] = useState(false);
  const [unreadPostsCount, setUnreadPostsCount] = useState(0);
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/allUsers`);
        setUsers(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
    fetchUnreadPostsCount();

    // Listen for updates from Posts component
    const handleUnreadPostsUpdate = (event) => {
      setUnreadPostsCount(event.detail.count);
    };

    window.addEventListener('unreadPostsUpdate', handleUnreadPostsUpdate);
    
    return () => {
      window.removeEventListener('unreadPostsUpdate', handleUnreadPostsUpdate);
    };
  }, []);

  const fetchUnreadPostsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/posts/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadPostsCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread posts count:", error);
    }
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { path: "/stats", label: "Statistics", icon: <BarChart2 className="w-5 h-5" /> },
    { 
      path: "/posts", 
      label: "Posts", 
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadPostsCount > 0 ? unreadPostsCount : null
    },
    { 
      label: "Prize Pool", 
      icon: <Gift className="w-5 h-5" />, 
      modal: true, 
      modalName: "prize" 
    },
    { 
      label: "Rules", 
      icon: <FileText className="w-5 h-5" />, 
      modal: true, 
      modalName: "rules" 
    },
  ];

  const otherLinks = [
    { 
      label: "Excel Sheet Leaderboard", 
      icon: <ExternalLink className="w-5 h-5" />, 
      external: true,
      href: "https://docs.google.com/spreadsheets/d/1YQRxSKM9WM2PVxmaOdNOQBaZVaScck1c7VzguJZldw4/edit?usp=sharing" 
    },
    { 
      label: "Instagram", 
      icon: <Instagram className="w-5 h-5" />, 
      external: true,
      href: "https://www.instagram.com/katthe_gang/" 
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleOpenModal = (modalName, e) => {
    e.preventDefault();
    // You'd need to implement a global state or context to handle modals
    // For now, we'll use a window event to communicate with the parent component
    window.dispatchEvent(new CustomEvent('openModal', { detail: { modalName } }));
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 h-full overflow-y-auto hidden md:block">
      <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">
        
      </h2>

      <div className="space-y-2">
        {menuItems.map((item, index) => (
          item.modal ? (
            <a
              href="#"
              key={index}
              onClick={(e) => handleOpenModal(item.modalName, e)}
              className="flex items-center space-x-3 p-2 rounded transition duration-300 hover:bg-gray-700 w-full"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ) : (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center justify-between p-2 rounded transition duration-300 ${
                isActive(item.path) ? "bg-blue-700" : "hover:bg-gray-700"
              } w-full`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        ))}

        {/* Other Links Dropdown */}
        <div className="pt-2">
          <button
            onClick={() => setShowOtherLinks(!showOtherLinks)}
            className="flex items-center justify-between space-x-3 p-2 rounded transition duration-300 hover:bg-gray-700 w-full"
          >
            <div className="flex items-center space-x-3">
              <LinkIcon className="w-5 h-5" />
              <span>Other Links</span>
            </div>
            {showOtherLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showOtherLinks && (
            <div className="pl-6 mt-1 space-y-1">
              {otherLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 rounded transition duration-300 hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Users Dropdown */}
        <div className="pt-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center justify-between space-x-3 p-2 rounded transition duration-300 hover:bg-gray-700 w-full"
          >
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5" />
              <span>Users</span>
            </div>
            {showUsers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showUsers && (
            <div className="pl-2 mt-2 space-y-2 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center p-4">
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-primary rounded-full"></span>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => {
                    const isCurrentUser = currentUser && currentUser._id === user._id;

                    return (
                      <div
                        key={user._id}
                        className={`flex items-center space-x-3 p-2 rounded transition duration-300 ${
                          isCurrentUser ? "bg-blue-700" : "hover:bg-gray-700"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrentUser ? "bg-blue-500" : "bg-indigo-600"
                          }`}
                        >
                          {getCapitalizedInitial(user.name)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {capitalizeFirstLetter(user.name)}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs">(You)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{user.mobile}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;