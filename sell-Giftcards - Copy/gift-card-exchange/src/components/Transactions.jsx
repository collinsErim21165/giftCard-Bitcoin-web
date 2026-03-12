import { Sidebarpage } from './Sidebarpage';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import TransactionDetails from './TransactionDetails';
import Loader from './Loader';
import { BsGift } from 'react-icons/bs';
import { FiBox } from 'react-icons/fi';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activePage, setActivePage] = useState('withdrawal');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Monitor authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in:", user.uid);
        setUserId(user.uid);
      } else {
        console.log("User is not signed in. Redirecting to sign-in page.");
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch transactions when userId changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (userId) {
        setLoading(true);
        setError(null);

        try {
          console.log("Fetching transactions for user ID:", userId);

          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            if (userData.role === 'admin') {
              const transactionQuery = query(
                collection(db, 'transactionHistory'),
                orderBy('time', 'desc')
              );

              const transactionSnapshot = await getDocs(transactionQuery);

              if (transactionSnapshot.empty) {
                console.log("No transactions found.");
                setTransactions([]);
              } else {
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

                console.log("Transactions list:", transactionList);
                setTransactions(transactionList);
              }
            } else {
              const transactionQuery = query(
                collection(db, 'transactionHistory'),
                where('userId', '==', userId),
                orderBy('time', 'desc')
              );

              const transactionSnapshot = await getDocs(transactionQuery);

              if (transactionSnapshot.empty) {
                console.log("No transactions found.");
                setTransactions([]);
              } else {
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

                console.log("Transactions list:", transactionList);
                setTransactions(transactionList);
              }
            }
          } else {
            setError("User not found.");
          }
        } catch (err) {
          console.error("Error fetching transactions:", err);
          setError(`Failed to fetch transactions: ${err.message}`);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("User ID is not set.");
        setError("User ID is not set.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const getGiftCardLogo = (type) => {
    const logos = {
      'Amazon': '/images/amazon.png',
      'GooglePlay': '/images/google-play.png',
      'Steam': '/images/Steam.png',
      'Xbox': '/images/Xbox.png',
      'Walmart': '/images/Walmart.png',
      'CVS': '/images/CVS.png',
      'American_Express': '/images/American-Express.png',
    };
    return logos[type] || '../assets/default.png';
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-row items-start justify-start bg-[rgb(255,240,120)] min-h-screen">
      <div className={isCollapsed ? 'md:mr-24' : 'md:mr-52 '}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} setActivePage={setActivePage} />
      </div>

      <div className="flex-1 px-4 py-8 md:px-12 md:py-12 mt-20 md:mt-0 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-7xl font-[1000] text-black leading-[0.9] tracking-tighter uppercase mb-4">
              Gift Card<br />
              <span className="text-black/20">History</span>
            </h1>
            <p className="text-black/60 text-sm font-black uppercase tracking-widest leading-relaxed">
              Track your Giftcard transaction logs in real-time.
            </p>
          </div>

          {transactions.length > 0 && (
            <div className="bg-black text-[rgb(255,240,120)] px-6 py-3 rounded-2xl font-black text-xs tracking-tighter shadow-xl">
              {transactions.length} TOTAL SESSIONS
            </div>
          )}
        </div>

        {/* Action Bar / Status Filter potentially here? User just asked for colors for now */}

        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : error ? (
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border border-black/5 text-center">
              <p className="text-red-500 font-black uppercase tracking-widest text-xs">{error}</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {transactions.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction)}
                  className="group flex flex-col items-start w-full bg-black rounded-[2.5rem] p-6 lg:p-8 border border-white/5 hover:border-[rgb(255,240,120)]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(255,240,120)] opacity-0 group-hover:opacity-5 -mr-16 -mt-16 rounded-full transform group-hover:scale-150 transition-all duration-700"></div>

                  <div className="flex items-center justify-between w-full mb-8 relative z-10">
                    <div className="w-16 h-16 bg-[rgb(255,240,120)] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-3 transition-transform overflow-hidden p-2">
                      <img
                        src={getGiftCardLogo(transaction.giftCard)}
                        alt={transaction.giftCard}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/56';
                        }}
                      />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${transaction.status === "Completed"
                      ? "bg-[#22c55e] text-white"
                      : transaction.status === "Pending"
                        ? "bg-[#f97316] text-white"
                        : "bg-[#ef4444] text-white"
                      }`}>
                      {transaction.status}
                    </div>
                  </div>

                  <div className="w-full relative z-10">
                    <p className="text-[10px] font-black text-[rgb(255,240,120)]/30 uppercase tracking-[0.2em] mb-1">Asset Brand</p>
                    <h3 className="text-2xl font-black text-white group-hover:text-[rgb(255,240,120)] transition-colors tracking-tighter mb-4">
                      {transaction.giftCard}
                    </h3>

                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Face Value</p>
                        <p className="text-xl font-black text-[rgb(255,240,120)] tracking-tighter">
                          {transaction.value}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Timeline</p>
                        <p className="text-[10px] font-black text-white/60 uppercase">
                          {transaction.displayDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 lg:p-20 bg-white/40 backdrop-blur-md rounded-[3rem] border border-black/5 text-center">
              <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-[rgb(255,240,120)] shadow-2xl mb-8 transform rotate-3">
                <FiBox className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-[1000] text-black tracking-tighter uppercase mb-4">No Assets Found</h3>
              <p className="text-black/40 text-sm font-black uppercase tracking-widest max-w-xs mx-auto mb-10 leading-relaxed">
                Your transaction history is empty. Time to cash in your first card.
              </p>
              <button
                onClick={() => navigate('/submit-gift-card')}
                className="px-10 py-5 bg-black text-[rgb(255,240,120)] rounded-3xl font-black text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                SELL YOUR ASSETS
              </button>
            </div>
          )}

          {selectedTransaction && (
            <TransactionDetails transaction={selectedTransaction} onClose={closeModal} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;