import React, { useEffect, useState } from "react";
import { Sidebarpage } from "./Sidebarpage";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const AdminUsers = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  /* ===============================
     FETCH USERS WITH BALANCES
  =============================== */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure balance exists with default value
          balance: doc.data().balance || 0,
        }));

        setUsers(list);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* ===============================
     TOTAL USERS
  =============================== */
  const totalUsers = users.length;

  /* ===============================
     NEW USERS TODAY
  =============================== */
  const today = new Date().toDateString();

  const newUsersToday = users.filter((user) => {
    if (!user.createdAt?.toDate) return false;
    return user.createdAt.toDate().toDateString() === today;
  }).length;

  /* ===============================
     TOTAL BALANCE
  =============================== */
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);

  /* ===============================
     SEARCH FILTER
  =============================== */
  const filteredUsers = users.filter((user) => {
    const name = user.fullName?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";

    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase())
    );
  });

  /* ===============================
     FORMAT NAIRA
  =============================== */
  const formatNaira = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  return (
    <div className="flex flex-col md:flex-row bg-[rgb(255,240,120)] min-h-screen w-full overflow-x-hidden">
      {/* SIDEBAR */}
      <div className={`fixed md:relative z-40 ${isCollapsed ? 'w-20 md:mr-0' : 'w-52 md:mr-24'} md:w-auto`}>
        <Sidebarpage
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 w-full md:ml-20 md:mt-0 mt-20 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-black/60 hover:text-black mb-6 flex items-center gap-2 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Users</h1>
            <p className="text-black/60 mt-1">View and manage all registered users</p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-black p-6 rounded-2xl shadow-sm">
              <p className="text-sm font-medium text-white/40 uppercase tracking-wider">Total Users</p>
              <h2 className="text-3xl font-bold text-[rgb(255,240,120)] mt-2">{totalUsers}</h2>
            </div>

            <div className="bg-black p-6 rounded-2xl shadow-sm">
              <p className="text-sm font-medium text-white/40 uppercase tracking-wider">New Users Today</p>
              <h2 className="text-3xl font-bold text-[rgb(255,240,120)] mt-2">{newUsersToday}</h2>
            </div>

            <div className="bg-black p-6 rounded-2xl shadow-sm">
              <p className="text-sm font-medium text-white/40 uppercase tracking-wider">Total Balance</p>
              <h2 className="text-3xl font-bold text-[rgb(255,240,120)] mt-2">{formatNaira(totalBalance)}</h2>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-black text-white placeholder-white/40 border border-white/20 shadow-sm focus:outline-none focus:border-[rgb(255,240,120)] transition-all"
              />
            </div>
          </div>

          {/* USERS LIST/TABLE */}
          <div className="bg-black rounded-2xl shadow-sm border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(255,240,120)] mx-auto mb-4"></div>
                <p className="text-white/40">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-white/40 italic">
                No users found.
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">#</th>
                        <th className="py-4 px-6 text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Full Name</th>
                        <th className="py-4 px-6 text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Email</th>
                        <th className="py-4 px-6 text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Balance</th>
                        <th className="py-3 px-4 text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Role</th>
                        <th className="py-4 px-6 text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">PIN Set</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user, index) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 text-white/40">{index + 1}</td>
                          <td className="py-4 px-6 font-semibold text-white">{user.fullName || "—"}</td>
                          <td className="py-4 px-6 text-white/60">{user.email || "—"}</td>
                          <td className="py-4 px-6 font-bold text-[rgb(255,240,120)]">
                            {formatNaira(user.balance || 0)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${user.role === 'admin'
                                ? 'bg-white/20 text-green-400'
                                : user.role === 'agent'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-white/10 text-white/60'
                              }`}>
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-xs font-bold tracking-widest ${user.transactionPin ? 'text-green-400' : 'text-red-400'}`}>
                              {user.transactionPin ? "✅ FIXED" : "❌ NONE"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y divide-white/5">
                  {filteredUsers.map((user, index) => (
                    <div key={user.id} className="p-5 active:bg-white/5 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-white/40">USER #{index + 1}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'admin'
                            ? 'bg-red-500/20 text-red-400'
                            : user.role === 'agent'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-white/10 text-white/60'
                          }`}>
                          {user.role || "user"}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg">{user.fullName || "Unnamed User"}</h3>
                      <p className="text-white/50 text-sm mb-3 underline">{user.email}</p>

                      {/* Balance Display for Mobile */}
                      <div className="mb-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/40">Balance</span>
                          <span className="font-bold text-[rgb(255,240,120)] text-lg">
                            {formatNaira(user.balance || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1 font-bold ${user.transactionPin ? 'text-green-400' : 'text-red-400'}`}>
                          PIN: {user.transactionPin ? "Set" : "Not Set"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;