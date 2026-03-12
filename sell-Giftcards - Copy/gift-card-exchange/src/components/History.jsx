import { useState, useEffect, useRef } from 'react';
import { useCryptoRates } from '../hooks/useCryptoRates';
import { collection, getDocs, query, where, orderBy, limit, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Sidebarpage } from './Sidebarpage';

/* COIN ICONS */
import {
  SiBitcoin,
  SiEthereum,
  SiTether,
  SiLitecoin,
  SiBinance,
  SiRipple,
  SiDogecoin,
  SiDash,
  SiBitcoincash,
} from "react-icons/si";
import trxIcon from "../assets/trx.svg";

// Import modern icons
import {
  BsArrowDown,
  BsArrowUp,
  BsClock,
  BsCheckCircle,
  BsXCircle,
  BsFilter,
  BsSearch,
  BsCalendar,
  BsChatDots,
  BsCashCoin,
} from 'react-icons/bs';


const COIN_ICONS = {
  BTC: <SiBitcoin className="text-orange-500 text-2xl" />,
  ETH: <SiEthereum className="text-indigo-500 text-2xl" />,
  USDT: <SiTether className="text-green-500 text-2xl" />,
  USDC: <SiTether className="text-blue-500 text-2xl" />,
  TRX: <img src={trxIcon} alt="TRX" className="w-6 text-red-500 h-6" />,
  BCH: <SiBitcoincash className="text-cyan-500 text-2xl" />,
  DASH: <SiDash className="text-gray-700 text-2xl" />,
  LTC: <SiLitecoin className="text-blue-500 text-2xl" />,
  BNB: <SiBinance className="text-yellow-500 text-2xl" />,
  XRP: <SiRipple className="text-black text-2xl" />,
  DOGE: <SiDogecoin className="text-yellow-600 text-2xl" />,
  BUSD: <SiBinance className="text-yellow-400 text-2xl" />,
};

const CRYPTO_COINS = [
  'BTC', 'ETH', 'USDT', 'USDC', 'LTC',
  'TRX', 'BCH', 'BNB', 'DASH', 'XRP',
  'DOGE', 'BUSD'
];

const History = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { rates: cryptoRates, ratesLoading } = useCryptoRates();
  // Ref so stale closures (onSnapshot, async fetches) always read the latest rates
  const cryptoRatesRef = useRef(cryptoRates);
  useEffect(() => { cryptoRatesRef.current = cryptoRates; }, [cryptoRates]);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const uid = auth.currentUser?.uid;

  const [depositHistory, setDepositHistory] = useState([]);

  // Calculate USD value from crypto amount
  const calculateUSDValue = (coin, amount) => {
    if (!coin || !amount) return 0;
    const upperCoin = coin.toUpperCase();
    const rate = cryptoRatesRef.current[upperCoin] || 0;
    return amount * rate;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      // Guard: Wait for user and rates to load
      if (!uid || ratesLoading) {
        if (!uid) {
          console.log('No user ID found');
          setLoading(false);
        }
        return;
      }

      try {
        const allTransactions = [];

        // Check user document
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
        } catch (err) {
          console.log(`Error fetching user: ${err.message}`);
        }

        // Fetch from transactionHistory (for sells/giftcards)
        try {
          const q = query(
            collection(db, 'transactionHistory'),
            where('userId', '==', uid)
          );
          const snapshot = await getDocs(q);

          snapshot.docs.forEach(doc => {
            const data = doc.data();

            // Get crypto amount and coin
            let cryptoAmount = 0;
            let coin = 'USD';

            if (data.giftCard) {
              coin = data.giftCard;
              cryptoAmount = data.amount || data.usdAmount || 0;
            } else if (data.asset) {
              coin = data.asset;
              cryptoAmount = data.cryptoAmount || data.amount || 0;
            } else if (data.coin) {
              coin = data.coin;
              cryptoAmount = data.cryptoAmount || data.amount || 0;
            }

            // Get timestamp
            let timestamp = new Date();
            if (data.time?.toDate) timestamp = data.time.toDate();
            else if (data.createdAt?.toDate) timestamp = data.createdAt.toDate();

            // Get direction first so we can decide how to compute USD
            // Treat 'sell' type (crypto sell) same as WITHDRAWAL for stats/filtering
            const direction = data.direction
              ? data.direction.toUpperCase()
              : (data.nairaValue > 0 || data.type === 'sell' ? 'WITHDRAWAL' : 'DEPOSIT');

            // Get USD amount
            // For crypto deposits always recalculate from live rates —
            // stored `amount` may have been saved at an old rate
            let usdAmount;
            if (direction === 'DEPOSIT' && cryptoAmount > 0 && coin !== 'USD' && CRYPTO_COINS.includes(coin.toUpperCase())) {
              usdAmount = calculateUSDValue(coin, cryptoAmount);
            } else {
              usdAmount = data.usdAmount || data.amount || 0;
              if (usdAmount === 0 && cryptoAmount > 0 && coin !== 'USD') {
                usdAmount = calculateUSDValue(coin, cryptoAmount);
              }
            }

            // Get message/description from data
            let message = data.message || data.description;
            if (!message) {
              if (direction === 'DEPOSIT') message = `Deposit to ${coin}`;
              else if (data.giftCard) message = `Sold ${data.giftCard} Gift Card`;
              else message = `Sold ${coin}`;
            }

            allTransactions.push({
              id: doc.id,
              source: 'transactionHistory',
              direction: direction,
              coin: coin.toUpperCase(),
              cryptoAmount: cryptoAmount,
              usdAmount: usdAmount,
              nairaValue: data.nairaValue || data.totalNaira || 0,
              status: data.status || 'completed',
              message: message,
              rate: data.rate || 0,
              createdAt: timestamp,
              address: data.address || null,
              txHash: data.txHash || null
            });
          });
        } catch (err) {
          console.log(`Error fetching transactionHistory: ${err.message}`);
        }

        // Fetch from withdrawals
        try {
          const q = query(
            collection(db, 'withdrawals'),
            where('userId', '==', uid)
          );
          const snapshot = await getDocs(q);

          snapshot.docs.forEach(doc => {
            const data = doc.data();

            let timestamp = new Date();
            if (data.createdAt?.toDate) timestamp = data.createdAt.toDate();
            else if (data.date) timestamp = new Date(data.date);

            allTransactions.push({
              id: doc.id,
              source: 'withdrawals',
              direction: 'WITHDRAWAL',
              coin: 'USD',
              cryptoAmount: data.amount || 0,
              usdAmount: data.amount || 0,
              nairaValue: data.amount || 0,
              status: data.status || 'pending',
              message: data.message || `Withdrawal to ${data.bankDetails?.bankName || 'bank'}`,
              createdAt: timestamp,
              bankDetails: data.bankDetails
            });
          });
        } catch (err) {
          console.log(`Error fetching withdrawals: ${err.message}`);
        }

        // Fetch from balanceAdditions
        try {
          const q = query(
            collection(db, 'balanceAdditions'),
            where('userId', '==', uid)
          );
          const snapshot = await getDocs(q);

          snapshot.docs.forEach(doc => {
            const data = doc.data();

            let timestamp = new Date();
            if (data.createdAt?.toDate) timestamp = data.createdAt.toDate();

            allTransactions.push({
              id: doc.id,
              source: 'balanceAdditions',
              direction: 'DEPOSIT',
              coin: 'USD',
              cryptoAmount: data.amount || 0,
              usdAmount: data.amount || 0,
              nairaValue: data.amount || 0,
              status: 'completed',
              message: data.reason || data.note || 'Balance added by admin',
              createdAt: timestamp
            });
          });
        } catch (err) {
          console.log(`Error fetching balanceAdditions: ${err.message}`);
        }

        // Fetch from users/{uid}/transactionHistory subcollection (coin deposits)
        try {
          const userTxRef = collection(db, 'users', uid, 'transactionHistory');
          const userTxSnapshot = await getDocs(userTxRef);

          userTxSnapshot.docs.forEach(docSnap => {
            const data = docSnap.data();

            // Avoid duplicates if already fetched from root transactionHistory
            if (allTransactions.some(t => t.id === docSnap.id)) return;

            let cryptoAmount = 0;
            let coin = 'USD';

            if (data.coin) {
              coin = data.coin;
              cryptoAmount = data.cryptoAmount || data.amount || 0;
            } else if (data.asset) {
              coin = data.asset;
              cryptoAmount = data.cryptoAmount || data.amount || 0;
            }

            let timestamp = new Date();
            if (data.createdAt?.toDate) timestamp = data.createdAt.toDate();
            else if (data.time?.toDate) timestamp = data.time.toDate();

            const direction = data.direction
              ? data.direction.toUpperCase()
              : (data.nairaValue > 0 || data.type === 'sell' ? 'WITHDRAWAL' : 'DEPOSIT');

            let usdAmount;
            if (direction === 'DEPOSIT' && cryptoAmount > 0 && coin !== 'USD' && CRYPTO_COINS.includes(coin.toUpperCase())) {
              usdAmount = calculateUSDValue(coin, cryptoAmount);
            } else {
              usdAmount = data.usdAmount || data.amount || 0;
              if (usdAmount === 0 && cryptoAmount > 0 && coin !== 'USD') {
                usdAmount = calculateUSDValue(coin, cryptoAmount);
              }
            }

            let message = data.message || data.description || data.notes;
            if (!message) {
              if (direction === 'DEPOSIT') message = `${coin} deposit received`;
              else message = `${coin} transaction`;
            }

            allTransactions.push({
              id: docSnap.id,
              source: 'userTransactionHistory',
              direction: direction,
              coin: coin.toUpperCase(),
              cryptoAmount: cryptoAmount,
              usdAmount: usdAmount,
              nairaValue: data.nairaValue || data.totalNaira || 0,
              status: data.status || 'Completed',
              message: message,
              rate: data.rate || 0,
              createdAt: timestamp,
              address: data.address || data.toAddress || null,
              txHash: data.txHash || null,
              network: data.network || null
            });
          });
        } catch (err) {
          console.log(`Error fetching user transactionHistory subcollection: ${err.message}`);
        }

        // Process and sort transactions
        const processed = allTransactions
          .filter(t => t.cryptoAmount > 0 || t.usdAmount > 0 || t.nairaValue > 0)
          .map(t => ({
            ...t,
            status: t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()) : 'Pending'
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setHistory(processed);

      } catch (err) {
        console.error('❌ Fatal error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [uid, ratesLoading]);

  // Real-time listener for the deposits collection
  useEffect(() => {
    if (!uid || ratesLoading) return;

    const q = query(
      collection(db, 'deposits'),
      where('userId', '==', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deposits = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const coin = (data.coin || data.asset || 'BTC').toUpperCase();
        const cryptoAmount = data.amount || 0;
        const usdAmount = calculateUSDValue(coin, cryptoAmount);
        const timestamp = data.detectedAt?.toDate ? data.detectedAt.toDate() : new Date();
        const status = data.status === 'confirmed' ? 'Completed' : 'Pending';

        return {
          id: docSnap.id,
          source: 'deposits',
          direction: 'DEPOSIT',
          coin,
          cryptoAmount,
          usdAmount,
          nairaValue: 0,
          status,
          message: `${coin} deposit received`,
          rate: 0,
          createdAt: timestamp,
          address: data.address || null,
          txHash: data.txHash || null,
          network: data.network || null
        };
      }).sort((a, b) => b.createdAt - a.createdAt);

      setDepositHistory(deposits);
    }, (err) => {
      console.error(`❌ Error listening to deposits: ${err.message}`);
    });

    return () => unsubscribe();
  }, [uid, ratesLoading]);

  // Merge deposits collection (real-time) with other history, deduplicating by txHash
  const allHistory = [
    ...history,
    ...depositHistory.filter(d =>
      !history.some(h => h.txHash && h.txHash === d.txHash)
    )
  ].sort((a, b) => b.createdAt - a.createdAt);

  // Filter transactions
  const filteredHistory = allHistory.filter(item => {
    if (filter === 'deposit' && item.direction !== 'DEPOSIT') return false;
    if (filter === 'withdrawal' && item.direction !== 'WITHDRAWAL') return false;
    if (selectedCoin !== 'all' && item.coin !== selectedCoin) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      (item.coin?.toLowerCase() || '').includes(searchLower) ||
      (item.status?.toLowerCase() || '').includes(searchLower) ||
      (item.message?.toLowerCase() || '').includes(searchLower) ||
      (item.direction?.toLowerCase() || '').includes(searchLower)
    );
  });

  const depositCount = allHistory.filter(h => h.direction === 'DEPOSIT').length;
  const withdrawalCount = allHistory.filter(h => h.direction === 'WITHDRAWAL').length;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffMs = now - transactionDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today, ' + transactionDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + transactionDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br bg-[rgb(255,240,120)]">
      <div className={isCollapsed ? 'md:mr-24 mr-1' : 'md:mr-52 mr-0'}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="w-full p-3 md:p-6 lg:p-8 pt-24 md:pt-6 lg:pt-8 overflow-y-auto">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                Transaction History
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Track all your deposits and withdrawals
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Total",
                value: allHistory.length,
                icon: <BsCalendar className="w-6 h-6" />,
                accent: "text-black"
              },
              {
                title: "Deposits",
                value: depositCount,
                icon: <BsArrowDown className="w-6 h-6" />,
                accent: "text-[#22c55e]"
              },
              {
                title: "Withdrawals",
                value: withdrawalCount,
                icon: <BsArrowUp className="w-6 h-6" />,
                accent: "text-[#ef4444]"
              }
            ].map((stat, index) => (
              <div key={index} className="bg-black rounded-[1rem] p-6 md:p-8 border border-white/5 hover:border-[rgb(255,240,120)]/20 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(255,240,120)] opacity-5 -mr-16 -mt-16 rounded-full transform group-hover:scale-150 transition-all duration-700"></div>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="w-12 h-12 bg-[rgb(255,240,120)] rounded-2xl flex items-center justify-center text-black mb-6 shadow-xl transform group-hover:rotate-6 transition-all">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[rgb(255,240,120)]/50 uppercase tracking-[0.2em] mb-2">{stat.title}</p>
                    <p className={`text-4xl font-[1000] text-white tracking-tighter`}>
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-black text-white/20 mt-2 uppercase tracking-widest">
                      Tracking Log
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Section */}
          <div className="bg-black rounded-xl p-6 lg:p-8 border border-white/5 mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[rgb(255,240,120)] opacity-5 -ml-32 -mb-32 rounded-full"></div>
            <div className="flex flex-col lg:flex-row gap-6 relative z-10">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/20 w-5 h-5" />
                <input
                  type="text"
                  placeholder="SEARCH TRANSACTIONS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-white/5 text-white rounded-3xl border border-white/5 focus:outline-none focus:ring-4 focus:ring-[rgb(255,240,120)]/20 text-xs font-black tracking-widest placeholder:text-white/20 transition-all uppercase"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-[rgb(255,240,120)] text-black rounded-xl text-[10px] font-[1000] uppercase tracking-widest shadow-lg">
                  FILTER BY
                </div>

                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all'
                    ? 'bg-[rgb(255,240,120)] text-black shadow-xl scale-105'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                >
                  ALL LOGS
                </button>

                <button
                  onClick={() => setFilter('deposit')}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'deposit'
                    ? 'bg-[#22c55e] text-white shadow-xl scale-105'
                    : 'bg-[rgb(255,240,120)] text-black hover:opacity-80'
                    }`}
                >
                  <BsArrowDown className="w-3 h-3" />
                  <span>DEPOSITS</span>
                </button>

                <button
                  onClick={() => setFilter('withdrawal')}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'withdrawal'
                    ? 'bg-[#ef4444] text-white shadow-xl scale-105'
                    : 'bg-[rgb(255,240,120)] text-black hover:opacity-80'
                    }`}
                >
                  <BsArrowUp className="w-3 h-3" />
                  <span>WITHDRAWALS</span>
                </button>
              </div>
            </div>

            {/* Coin Filter */}
            <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCoin('all')}
                  className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCoin === 'all'
                    ? 'bg-[rgb(255,240,120)] text-black shadow-lg'
                    : 'bg-white/5 text-white/30 hover:bg-white/10'
                    }`}
                >
                  EVERY ASSET
                </button>
                {CRYPTO_COINS.map(coin => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCoin === coin
                      ? 'bg-[rgb(255,240,120)] text-black shadow-lg'
                      : 'bg-white/5 text-white/30 hover:bg-white/10'
                      }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {COIN_ICONS[coin]}
                    </div>
                    <span>{coin}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Display */}
          {loading ? (
            <div className="text-center py-8 md:py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-3 md:mt-4 text-gray-600 text-sm md:text-base">Loading transactions...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 md:py-12 bg-black rounded-lg md:rounded-xl ">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <BsSearch className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
              </div>
              <h3 className="mt-3 md:mt-4 text-base md:text-lg font-semibold text-white">No transactions found</h3>
              <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
                {allHistory.length === 0 ? 'No transactions in database yet' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            /* Grid View */
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredHistory.map((item) => {
                  const isDeposit = item.direction === 'DEPOSIT';
                  const isWithdrawal = item.direction === 'WITHDRAWAL';

                  let bgColor = 'bg-gray-100';
                  let iconColor = 'text-gray-600';
                  let Icon = BsCashCoin;

                  if (isDeposit) {
                    bgColor = 'bg-green-100';
                    iconColor = 'text-green-600';
                    Icon = BsArrowDown;
                  } else if (isWithdrawal) {
                    bgColor = 'bg-red-100';
                    iconColor = 'text-red-600';
                    Icon = BsArrowUp;
                  }

                  // Display amount based on transaction type
                  const displayAmount = item.coin === 'USD'
                    ? formatUSD(item.usdAmount)
                    : `${item.cryptoAmount.toFixed(8)} ${item.coin}`;

                  return (
                    <div
                      key={item.id}
                      className="bg-black rounded-[2.5rem] p-6 lg:p-8 border border-white/5 hover:border-[rgb(255,240,120)]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden relative group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(255,240,120)] opacity-0 group-hover:opacity-5 -mr-16 -mt-16 rounded-full transform group-hover:scale-150 transition-all duration-700"></div>

                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-3 transition-transform ${bgColor} bg-opacity-20`}>
                            <Icon className={`w-7 h-7 ${iconColor}`} />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-lg uppercase tracking-tighter leading-none mb-2">
                              {item.direction}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center">
                                {COIN_ICONS[item.coin] || <span className="text-[10px] font-black text-[rgb(255,240,120)]">{item.coin}</span>}
                              </div>
                              <span className="font-black text-[rgb(255,240,120)] text-xs tracking-widest uppercase">{item.coin}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${item.status === 'Completed' || item.status === 'completed'
                          ? 'bg-[#22c55e] text-white'
                          : item.status === 'Pending' || item.status === 'pending'
                            ? 'bg-[#f97316] text-white'
                            : 'bg-[#ef4444] text-white'
                          }`}>
                          {item.status}
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="space-y-4 mb-8 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:bg-white/10 transition-colors">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Amount</p>
                            <p className="font-black text-white text-sm break-all font-mono">
                              {displayAmount}
                            </p>
                          </div>

                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:bg-white/10 transition-colors">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">USD Value</p>
                            <p className="font-black text-[rgb(255,240,120)] text-base lg:text-lg tracking-tighter">
                              {formatUSD(item.usdAmount)}
                            </p>
                          </div>
                        </div>

                        {item.rate > 0 && (
                          <div className="bg-[rgb(255,240,120)]/10 rounded-2xl p-4 border border-[rgb(255,240,120)]/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[9px] font-black text-[rgb(255,240,120)]/50 uppercase tracking-widest mb-1">Exchange Rate</p>
                                <p className="font-black text-[rgb(255,240,120)] text-sm tracking-tighter">
                                  ₦{item.rate.toFixed(2)}/$
                                </p>
                              </div>
                              <BsCashCoin className="w-5 h-5 text-[rgb(255,240,120)]/40" />
                            </div>
                          </div>
                        )}

                        {item.nairaValue > 0 && (
                          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Settlement</p>
                            <p className="font-black text-white text-xl tracking-tighter">
                              {formatCurrency(item.nairaValue)}
                            </p>
                          </div>
                        )}

                        {item.message && (
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="flex items-start gap-3">
                              <BsChatDots className="w-4 h-4 text-white/20 mt-1 flex-shrink-0" />
                              <p className="text-xs font-medium text-white/60 leading-relaxed">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-white/5 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white/30">
                            <BsClock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(item.createdAt)}</span>
                          </div>
                          {item.address && (
                            <span className="text-[10px] font-black text-white/20 tracking-tighter font-mono">
                              {item.address.slice(0, 10)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredHistory.map((item) => {
                  const isDeposit = item.direction === 'DEPOSIT';
                  const isWithdrawal = item.direction === 'WITHDRAWAL';

                  let bgColor = 'bg-white/10';
                  let iconColor = 'text-white/60';
                  let Icon = BsCashCoin;

                  if (isDeposit) {
                    bgColor = 'bg-green-500/10';
                    iconColor = 'text-green-500';
                    Icon = BsArrowDown;
                  } else if (isWithdrawal) {
                    bgColor = 'bg-red-500/10';
                    iconColor = 'text-red-500';
                    Icon = BsArrowUp;
                  }

                  const displayAmount = item.coin === 'USD'
                    ? formatUSD(item.usdAmount)
                    : `${item.cryptoAmount.toFixed(8)} ${item.coin}`;

                  return (
                    <div
                      key={item.id}
                      className="bg-black rounded-3xl p-4 md:p-6 border border-white/5 shadow-xl hover:scale-[1.01] transition-all active:scale-[0.99]"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl ${bgColor}`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-5 h-5 flex items-center justify-center">
                                {COIN_ICONS[item.coin] || <span className="text-[10px] font-black text-[rgb(255,240,120)]">{item.coin}</span>}
                              </div>
                              <h3 className="font-black text-white text-lg tracking-tighter uppercase leading-none">
                                {item.direction}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                              <span className="text-white/40">{formatDate(item.createdAt)}</span>
                              <span className="text-white/20">•</span>
                              <span className="text-white/40 font-mono lower">{displayAmount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-row md:flex-col items-center justify-between md:items-end gap-6 ml-16 md:ml-0">
                          <div className="text-right flex flex-col items-end gap-1">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Market Value</p>
                            <p className="font-black text-[rgb(255,240,120)] text-xl tracking-tighter leading-none">
                              {formatUSD(item.usdAmount)}
                            </p>
                          </div>

                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg ${item.status === 'Completed' || item.status === 'completed'
                            ? 'bg-[#22c55e] text-white'
                            : item.status === 'Pending' || item.status === 'pending'
                              ? 'bg-[#f97316] text-white'
                              : 'bg-[#ef4444] text-white'
                            }`}>
                            {item.status}
                          </div>
                        </div>
                      </div>

                      {/* Optional Message */}
                      {item.message && (
                        <div className="mt-4 md:ml-20 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-start gap-3">
                            <BsChatDots className="w-4 h-4 text-white/30 mt-1 flex-shrink-0" />
                            <p className="text-xs font-medium text-white/60 leading-relaxed">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default History;