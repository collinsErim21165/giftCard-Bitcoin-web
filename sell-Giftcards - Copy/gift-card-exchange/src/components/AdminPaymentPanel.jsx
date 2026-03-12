import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  addDoc
} from "firebase/firestore";
import { Sidebarpage } from './Sidebarpage';
import { useNavigate } from 'react-router-dom';
import AdminCryptoTransactionHistory from './AdminCryptoTransactionHistory';
import AdminWithdrawals from './AdminWithdrawals';
import usePopup from './usePopup';
import CustomPopup from './CustomPopup';

const AdminPaymentPanel = () => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [sweeps, setSweeps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const navigate = useNavigate();
  const { popup, showPopup, closePopup } = usePopup();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkAdmin();
  }, []);

  // SIMPLE function to add money to user's balance (NO PAYMENT)
  const addUserBalance = async () => {
    if (!userId || !amount) {
      setError("Please enter User ID and Amount");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentBalance = userData.balance || 0;
        const newBalance = currentBalance + amountNum;

        // 1. Update user balance
        await updateDoc(userDocRef, {
          balance: newBalance
        });

        // 2. Record the addition
        await addDoc(collection(db, "balanceAdditions"), {
          userId: userId,
          userName: userData.fullName || userData.email || 'Unknown',
          amount: amountNum,
          previousBalance: currentBalance,
          newBalance: newBalance,
          addedBy: auth.currentUser.uid,
          date: new Date().toISOString(),
          type: 'admin_addition',
          note: 'Payment for gift card/bitcoin'
        });

        // 3. Show success
        // 3. Show success
        showPopup('success', 'Balance Added', `✅ Added ₦${amountNum.toLocaleString()} to ${userData.fullName || userId}
        
        Previous balance: ₦${currentBalance.toLocaleString()}
        New balance: ₦${newBalance.toLocaleString()}
        
        ⚠️ REMEMBER: You need to have ₦${amountNum} in your business account
        to cover this when the user withdraws!`, closePopup);

        // Reset form
        setUserId('');
        setAmount('');

      } else {
        setError("User not found. Please check the User ID.");
      }
    } catch (err) {
      console.error("Error updating user balance:", err);
      setError("Failed to update user balance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch gift card transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionQuery = query(collection(db, 'transactionHistory'), orderBy('time', 'desc'));
      const transactionSnapshot = await getDocs(transactionQuery);
      const transactionList = transactionSnapshot.docs.map((doc) => {
        const data = doc.data();
        const time = data.time.toDate();
        return {
          id: doc.id,
          ...data,
          displayTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          displayDate: time.toLocaleDateString(),
        };
      });
      setTransactions(transactionList);
    };

    fetchTransactions();
  }, []);

  // Fetch Bitcoin wallet sweep monitoring
  const fetchSweeps = async () => {
    try {
      const sweepQuery = query(collection(db, 'wallets'), orderBy('createdAt', 'desc'));
      const sweepSnapshot = await getDocs(sweepQuery);
      const sweepList = sweepSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate();
        return {
          id: doc.id,
          ...data,
          displayDate: createdAt ? createdAt.toLocaleDateString() : 'N/A',
        };
      });
      setSweeps(sweepList);
    } catch (err) {
      console.error("Error fetching sweeps:", err);
    }
  };

  useEffect(() => {
    fetchSweeps();
  }, []);

  // Navigate to transaction details
  const viewTransactionDetails = (transactionId) => {
    navigate(`/admin/transaction/${transactionId}`);
  };

  // Navigate to sweep wallet details
  const viewSweepDetails = (walletId) => {
    navigate(`/admin/wallet/${walletId}`);
  };

  // Retry sweep for failed wallets
  const retrySweep = async (walletId) => {
    try {
      await updateDoc(doc(db, "wallets", walletId), {
        "sweep.status": "idle",
        "sweep.error": null
      });
      showPopup('success', 'Retry Initiated', "Sweep retry initiated!", closePopup);
      fetchSweeps();
    } catch (err) {
      console.error("Error retrying sweep:", err);
      showPopup('error', 'Retry Failed', "Failed to retry sweep. Please try again.", closePopup);
    }
  };

  // Business Funds Tracker
  const [funds, setFunds] = useState({
    totalUserBalances: 0,
    totalWithdrawn: 0,
    totalAdded: 0,
    businessBalance: 0
  });

  useEffect(() => {
    calculateFunds();
  }, []);

  const calculateFunds = async () => {
    try {
      // Calculate total money in user wallets
      const usersSnapshot = await getDocs(collection(db, "users"));
      let totalUserBalances = 0;
      usersSnapshot.forEach(doc => {
        totalUserBalances += doc.data().balance || 0;
      });

      // Calculate total added by admin
      const additionsSnapshot = await getDocs(collection(db, "balanceAdditions"));
      let totalAdded = 0;
      additionsSnapshot.forEach(doc => {
        totalAdded += doc.data().amount || 0;
      });

      // Calculate total withdrawn
      const withdrawalsSnapshot = await getDocs(collection(db, "withdrawals"));
      let totalWithdrawn = 0;
      withdrawalsSnapshot.forEach(doc => {
        if (doc.data().status === 'completed') {
          totalWithdrawn += doc.data().amount || 0;
        }
      });

      // Estimated business balance needed
      const businessBalance = totalAdded - totalWithdrawn;

      setFunds({
        totalUserBalances,
        totalAdded,
        totalWithdrawn,
        businessBalance
      });

      // Calculate pending withdrawals count
      const pendingQuery = query(collection(db, "withdrawals"), where("status", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      setPendingWithdrawals(pendingSnapshot.size);

    } catch (error) {
      console.error("Error calculating funds:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-[rgb(255,240,120)] min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <div className={`fixed md:relative z-40 ${isCollapsed ? 'w-20 md:mr-0' : 'w-52 md:mr-24'} md:w-auto`}>
        <Sidebarpage
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 md:ml-20 md:mt-0 mt-20 p-4 md:p-4">
        <CustomPopup popup={popup} onClose={closePopup} />
        {isAdmin ? (
          <div className="flex flex-col gap-8">
            {/* Admin Balance Addition Section */}
            <div className={`bg-black rounded-lg shadow-md p-4 sm:p-6 md:p-8 ${isCollapsed ? ' md:mr-0 ' : ' md:mr-12 md:ml-12'}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[rgb(255,240,120)]">Add User Balance</h2>

              {error && <p className="text-red-400 bg-red-900/30 p-3 rounded mb-4">{error}</p>}

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4 mb-6">
                <div className="flex flex-col w-full sm:w-1/2">
                  <label className="text-sm sm:text-base font-semibold mb-2 text-white">User ID</label>
                  <input
                    type="text"
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="h-12 pl-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/40 rounded-md focus:outline-none focus:border-[rgb(255,240,120)] w-full"
                  />
                </div>

                <div className="flex flex-col w-full sm:w-1/2">
                  <label className="text-sm sm:text-base font-semibold mb-2 text-white">Amount (₦)</label>
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 pl-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/40 rounded-md focus:outline-none focus:border-[rgb(255,240,120)] w-full"
                    min="1"
                  />
                </div>
              </div>

              <button
                onClick={addUserBalance}
                disabled={loading || !userId || !amount}
                className="h-12 w-full sm:w-60 bg-[rgb(255,240,120)] text-black rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Balance to User"}
              </button>

              <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded">
                <p className="text-sm text-yellow-300">
                  ⚠️ <strong>Important:</strong> This adds virtual balance only.
                  You need real money in your business account when users withdraw.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`bg-black rounded-lg shadow-md p-4 sm:p-6 md:p-8 ${isCollapsed ? ' md:mr-0 ' : ' md:mr-12 md:ml-12'}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[rgb(255,240,120)]">Quick Actions</h2>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => navigate('/Admin-Withdrawals')}
                  className="p-4 bg-green-700 hover:bg-green-900 border border-white/10 rounded-lg transition text-left flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold block text-white">💸 Process Withdrawals</span>
                    <span className="text-sm text-white/50">Send money to users</span>
                  </div>
                  {pendingWithdrawals > 0 && (
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse shadow-sm">
                      {pendingWithdrawals} Pending
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Gift Card Transaction History Section */}
            <div className={`bg-black border border-white/10 rounded-lg shadow-md p-4 sm:p-6 md:p-8 overflow-x-auto ${isCollapsed ? ' md:mr-0 ' : ' md:mr-12 md:ml-12'}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[rgb(255,240,120)]">Gift Card Transactions</h2>

              <div className="w-full overflow-y-auto max-h-[500px]">
                {transactions.length === 0 ? (
                  <p className="text-white/40 text-center py-6">No transactions found.</p>
                ) : (
                  <table className="w-full border-collapse text-sm sm:text-base">
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255,240,120,0.07)' }}>
                        <th className="p-2 text-left text-[rgb(255,240,120)] text-xs uppercase tracking-wider font-bold">#</th>
                        <th className="p-2 text-left text-[rgb(255,240,120)] text-xs uppercase tracking-wider font-bold">Gift Card</th>
                        <th className="p-2 text-left text-[rgb(255,240,120)] text-xs uppercase tracking-wider font-bold">Date</th>
                        <th className="p-2 text-left text-[rgb(255,240,120)] text-xs uppercase tracking-wider font-bold">Value</th>
                        <th className="p-2 text-left text-[rgb(255,240,120)] text-xs uppercase tracking-wider font-bold">Status</th>
                        <th className="p-2 text-left text-[rgb(255,240,120)] text-xs uppercase tracking-wider font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="p-2 text-white/40">{index + 1}</td>
                          <td className="p-2 text-white font-medium">{transaction.giftCard}</td>
                          <td className="p-2 text-white/60">{transaction.displayDate}</td>
                          <td className="p-2 text-white">{transaction.value}</td>
                          <td className="p-2">
                            <span
                              className={`font-semibold ${transaction.status === 'Completed'
                                ? 'text-green-400'
                                : transaction.status === 'Pending'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                                }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => viewTransactionDetails(transaction.id)}
                              className="bg-[rgb(255,240,120)] text-black px-3 py-1 rounded font-bold hover:opacity-80 transition"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>



            {/* Crypto Transactions */}
            <div className={`rounded-lg shadow-md ${isCollapsed ? ' md:mr-0' : ' md:ml-12'} overflow-hidden`}>
              <AdminCryptoTransactionHistory />
            </div>

            
          </div>
        ) : (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 text-xl font-bold">⛔ Access Denied</p>
              <p className="text-gray-600 mt-2">You are not authorized to access this panel.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentPanel;