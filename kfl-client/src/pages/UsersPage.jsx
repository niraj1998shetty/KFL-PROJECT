import React, { useEffect, useState } from "react";
import axios from "axios";
import { capitalizeFirstLetter } from "../helpers/functions";
import { useAuth } from "../contexts/AuthContext";



const UsersPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <main className="flex-grow bg-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">

          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <h1 className="text-base sm:text-lg font-semibold">Users</h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-600 rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-col flex-grow overflow-hidden">

              {/* TABLE HEADER */}
              <div className="bg-gray-50 border-b border-gray-200">
                <table className="w-full table-fixed">
                  <thead>
                    <tr>
                      <th className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        No
                      </th>
                      <th className="w-1/2 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mobile No
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* TABLE BODY */}
              <div className="overflow-y-auto flex-grow">
                <table className="w-full table-fixed">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((user, index) => {
                        const isCurrentUser = user._id === currentUser?._id;
                        return(
                        <tr key={user._id}>
                          <td className="w-16 px-6 py-4 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="w-1/2 px-6 py-4 text-sm font-medium text-gray-900 text-center truncate">
                            {capitalizeFirstLetter(user.name)}
                             {isCurrentUser && (
                                <span className="ml-1 text-purple-600 font-semibold">
                                  (You)
                                </span>
                             )}
                          </td>
                          <td className="w-1/3 px-6 py-4 text-sm text-gray-900">
                            {user.mobile}
                          </td>
                        </tr>
                        );
  })
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default UsersPage;
