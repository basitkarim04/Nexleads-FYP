import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import nexLeadlogo from "../assets/Images/nexLeadLogo.png";
import {
  fetchDashboardStats,
  fetchAllUsers,
  toggleUserBlock,
  clearError,
  clearSuccess
} from "../Redux/Features/Adminslice";

export default function AdminPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Get data from Redux store
  const { stats, users, loading, statsLoading, usersLoading, error, success } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      dispatch(fetchAllUsers(search));
    }, 500);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [search]);

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      // You can show a success toast here
      console.log("Action completed successfully");
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      // You can show an error toast here
      console.error("Error:", error);
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleToggleBlock = async (userId) => {
    await dispatch(toggleUserBlock(userId));
    // Refresh users list after blocking/unblocking
    dispatch(fetchAllUsers(search));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#052659] px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src={nexLeadlogo}
              alt="Logo"
              className="w-24 md:w-32 object-contain"
            />
            <h1 className="text-xl md:text-3xl font-bold text-[#F2FAFF]">
              Admin Dashboard
            </h1>
          </div>

          {/* Right: Logout Button */}
          <button
            onClick={handleLogout}
            className="mb-5 sm:mb-0 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-4">
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Users</h2>
          <p className="text-3xl font-bold text-[#052659] mt-2">
            {statsLoading ? (
              <span className="text-lg">Loading...</span>
            ) : (
              stats.totalUsers
            )}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Leads</h2>
          <p className="text-3xl font-bold text-[#052659] mt-2">
            {statsLoading ? (
              <span className="text-lg">Loading...</span>
            ) : (
              stats.totalLeads
            )}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Platform Earning</h2>
          <p className="text-3xl font-bold text-[#052659] mt-2">
            {statsLoading ? (
              <span className="text-lg">Loading...</span>
            ) : (
              `$${stats.totalEarnings}`
            )}
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-4 mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Action completed successfully!
        </div>
      )}

      {/* Search */}
      <div className="mb-6 p-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl overflow-x-auto m-4">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#5483B3] text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Previous Package</th>
              <th className="px-6 py-3">Current Package</th>
              <th className="px-6 py-3">Lead Count</th>
              <th className="px-6 py-3 text-center">Block User</th>
            </tr>
          </thead>

          <tbody>
            {usersLoading ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b ${user.blocked ? "bg-red-50 opacity-70" : ""
                    }`}
                >
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.previousPackage}</td>
                  <td className="px-6 py-4 font-semibold">
                    {user.currentPackage}
                  </td>
                  <td className="px-6 py-4">{user.leads}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleBlock(user.id)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg text-white text-xs ${user.blocked
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {loading ? "..." : user.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}