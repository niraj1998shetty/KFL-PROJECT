import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { capitalizeFirstLetter, getCapitalizedInitial } from '../helpers/functions';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/auth/allUsers`);
        console.log(res.data);
        setUsers(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-64 bg-gray-800 text-white p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">Members List</h2>
      
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const isCurrentUser = currentUser && currentUser._id === user._id;
            
            return (
              <div 
                key={user._id} 
                className={`flex items-center space-x-3 p-2 rounded transition duration-300 ${
                  isCurrentUser 
                    ? 'bg-blue-700' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrentUser ? 'bg-blue-500' : 'bg-indigo-600'
                }`}>
                  {getCapitalizedInitial(user.name)}
                </div>
                <div>
                  <div className="font-medium">
                    {capitalizeFirstLetter(user.name)}
                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </div>
                  <div className="text-xs text-gray-400">{user.mobile}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sidebar;