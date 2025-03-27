import React, { useEffect, useState } from "react";
import axios from "axios";

const SemifinalPredictionViewModal = ({ onClose, currentUser }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/semifinals/all`);

        // Format the prediction
        const formattedPredictions = response.data.map((prediction) => ({
          user: prediction.user.name,
          mobile: prediction.user.mobile,
          teams: prediction.teams,
          isCurrentUser: prediction.user._id === currentUser._id,
        }));

        setPredictions(formattedPredictions);
      } catch (error) {
        console.error("Error fetching semifinal predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [currentUser, API_URL]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full flex flex-col max-h-[90vh]">
        <div className="bg-indigo-700 text-white p-4 rounded-t-lg flex-shrink-0">
          <h3 className="text-lg font-semibold">Semifinal Predictions</h3>
          <p className="text-sm">View all users' semifinal team predictions</p>
        </div>

        <div className="p-6 overflow-auto flex-grow">
          {loading ? (
            <div className="text-center py-4">
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-primary rounded-full"></span>
              </span>
            </div>
          ) : predictions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                      Team 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                      Team 2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                      Team 3
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                      Team 4
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                      Team 5
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((prediction, index) => (
                    <tr
                      key={index}
                      className={prediction.isCurrentUser ? "bg-blue-50" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {prediction.user} {prediction.isCurrentUser && "(You)"}
                      </td>
                      {prediction.teams.map((team, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-xs font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
                              {team}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No predictions found
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SemifinalPredictionViewModal;