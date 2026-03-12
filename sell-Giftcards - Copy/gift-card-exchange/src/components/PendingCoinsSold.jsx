import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Sidebarpage } from './Sidebarpage';
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
import {
  BsArrowDown,
  BsArrowUp,
  BsSearch,
  BsArrowRepeat,
  BsChevronLeft,
  BsChevronRight,
  BsArrowLeft,
  BsGraphUp,
  BsCurrencyDollar,
  BsCashCoin,
  BsPercent,
  BsArrowRight,
  BsListUl,
  BsClock,
  BsExclamationCircle,
  BsCheckCircle,
  BsXCircle,
  BsHourglass
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import usePopup from './usePopup';
import CustomPopup from './CustomPopup';

const COIN_ICONS = {
  BTC: { icon: <SiBitcoin className="text-2xl" />, color: "bg-white/10 text-orange-400" },
  ETH: { icon: <SiEthereum className="text-2xl" />, color: "bg-white/10 text-indigo-400" },
  USDT: { icon: <SiTether className="text-2xl" />, color: "bg-white/10 text-green-400" },
  USDC: { icon: <SiTether className="text-2xl" />, color: "bg-white/10 text-blue-400" },
  TRX: { icon: <img src={trxIcon} alt="TRX" className="w-6 h-6" />, color: "bg-white/10 text-red-400" },
  BCH: { icon: <SiBitcoincash className="text-2xl" />, color: "bg-white/10 text-cyan-400" },
  DASH: { icon: <SiDash className="text-2xl" />, color: "bg-white/10 text-white/70" },
  LTC: { icon: <SiLitecoin className="text-2xl" />, color: "bg-white/10 text-blue-400" },
  BNB: { icon: <SiBinance className="text-2xl" />, color: "bg-white/10 text-yellow-400" },
  XRP: { icon: <SiRipple className="text-2xl" />, color: "bg-white/10 text-white" },
  DOGE: { icon: <SiDogecoin className="text-2xl" />, color: "bg-white/10 text-yellow-400" },
  BUSD: { icon: <SiBinance className="text-2xl" />, color: "bg-white/10 text-yellow-400" },
};

const CRYPTO_COINS = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'TRX', 'BCH', 'BNB', 'DASH', 'XRP', 'DOGE', 'BUSD'];

const PendingCoinsSold = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [coinStats, setCoinStats] = useState({});
  const [userMap, setUserMap] = useState({});
  const [totalStats, setTotalStats] = useState({
    totalPendingUSD: 0,
    totalPendingNGN: 0,
    totalPendingCrypto: 0,
    transactionCount: 0,
    oldestPendingDays: 0
  });
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const navigate = useNavigate();
  const { popup, showPopup, closePopup } = usePopup();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const map = {};
      usersSnap.forEach((doc) => {
        const data = doc.data();
        map[doc.id] = data.fullName || data.email || data.phoneNumber || "Unknown User";
      });
      setUserMap(map);
      return map;
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load user data");
      return {};
    }
  };

  const fetchPendingTransactions = useCallback(async (userMapData = {}) => {
    try {
      setLoading(true);
      setError(null);

      let q;
      let hasOrderBy = false;

      try {
        // Query for pending sell transactions
        q = query(
          collection(db, 'transactionHistory'),
          where('status', 'in', ['Pending', 'Processing', 'Awaiting Payment', 'Pending Review']),
          where('type', '==', 'sell'),
          orderBy('createdAt', 'desc')
        );
        hasOrderBy = true;
      } catch (indexError) {
        console.log("Index error, using simpler query:", indexError);
        // Fallback to simpler query while index is building
        q = query(
          collection(db, 'transactionHistory'),
          where('type', '==', 'sell')
        );
        hasOrderBy = false;
      }

      const snap = await getDocs(q);

      console.log("Query snapshot size:", snap.size);

      const rows = [];
      const stats = {};
      let totalPendingUSD = 0;
      let totalPendingNGN = 0;
      let totalPendingCrypto = 0;
      let oldestTimestamp = new Date();
      let now = new Date();

      snap.forEach(doc => {
        try {
          const tx = doc.data();
          const coin = tx.coin?.toUpperCase();

          if (!coin || !CRYPTO_COINS.includes(coin)) return;

          // Filter for pending status transactions
          const status = tx.status?.toLowerCase() || '';
          if (!['pending', 'processing', 'awaiting payment', 'pending review'].includes(status)) {
            return;
          }

          const usdAmount = Number(tx.amount || 0);
          const rate = Number(tx.rate || 1);
          const nairaAmount = Number(tx.nairaValue || (usdAmount * rate));
          const cryptoAmount = Number(tx.cryptoAmount || (rate > 0 ? usdAmount / rate : usdAmount));
          const timestamp = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || Date.now());

          // Track oldest transaction
          if (timestamp < oldestTimestamp) {
            oldestTimestamp = timestamp;
          }

          if (!stats[coin]) {
            stats[coin] = {
              coin,
              totalUSD: 0,
              totalNGN: 0,
              totalCrypto: 0,
              transactionCount: 0,
              avgRate: 0,
              rateCount: 0,
              oldestTransaction: timestamp,
              transactions: []
            };
          }

          // Add to coin stats
          stats[coin].totalUSD += usdAmount;
          stats[coin].totalNGN += nairaAmount;
          stats[coin].totalCrypto += cryptoAmount;
          stats[coin].transactionCount += 1;
          stats[coin].rateCount += 1;
          stats[coin].avgRate = stats[coin].avgRate + (rate - stats[coin].avgRate) / stats[coin].rateCount;

          if (timestamp < stats[coin].oldestTransaction) {
            stats[coin].oldestTransaction = timestamp;
          }

          // Store transaction for this coin
          const transactionData = {
            id: doc.id,
            coin,
            usdAmount,
            cryptoAmount,
            nairaAmount,
            rate,
            timestamp,
            status: tx.status,
            type: tx.type,
            userId: tx.userId,
            userName: userMapData[tx.userId] || "Unknown User",
            userEmail: tx.userEmail || '',
            userPhone: tx.userPhone || '',
            paymentMethod: tx.paymentMethod || 'Bank Transfer',
            paymentDetails: tx.paymentDetails || {},
            notes: tx.notes || '',
            expectedDelivery: tx.expectedDelivery || '',
            createdAt: timestamp
          };
          stats[coin].transactions.push(transactionData);

          // Add to global totals
          totalPendingUSD += usdAmount;
          totalPendingNGN += nairaAmount;
          totalPendingCrypto += cryptoAmount;

          // Add to all rows
          rows.push(transactionData);
        } catch (docError) {
          console.error("Error processing document:", doc.id, docError);
        }
      });

      // Sort by date if we couldn't use orderBy in the query
      if (!hasOrderBy && rows.length > 0) {
        rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      // Sort transactions for each coin by date
      Object.values(stats).forEach(coinStat => {
        coinStat.transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      // Calculate days since oldest pending transaction
      const oldestPendingDays = Math.floor((now - oldestTimestamp) / (1000 * 60 * 60 * 24));

      setTransactions(rows);
      setCoinStats(stats);
      setTotalStats({
        totalPendingUSD,
        totalPendingNGN,
        totalPendingCrypto,
        transactionCount: rows.length,
        oldestPendingDays
      });

      console.log("Loaded pending transactions:", rows.length);

    } catch (e) {
      console.error("Error fetching pending transactions:", e);
      setError(`Failed to load pending transactions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await fetchUsers();
      await fetchPendingTransactions(userData);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'NGN') => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = 0;
    }

    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return formatter.format(amount);
  };

  const formatUSD = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = 0;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return '< 1 hour ago';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    } else {
      return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
    }
  };

  const formatCrypto = (amount, coin) => {
    const decimals = ['BTC', 'ETH', 'BNB'].includes(coin) ? 8 :
      ['USDT', 'USDC', 'BUSD'].includes(coin) ? 2 : 6;
    return `${(amount || 0).toFixed(decimals)} ${coin}`;
  };

  const handleBack = () => {
    if (viewMode === 'coinDetail') {
      setViewMode('overview');
      setSelectedCoin(null);
    } else {
      navigate(-1);
    }
  };

  const handleCoinClick = (coin) => {
    if (coin === 'all') {
      setActiveFilter('all');
      setViewMode('overview');
      setSelectedCoin(null);
    } else {
      setActiveFilter(coin);
      setSelectedCoin(coin);
      setViewMode('coinDetail');
      setCurrentPage(1);
    }
  };

  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentTxIds = (viewMode === 'coinDetail' ? coinDetailTransactions : currentTransactions).map(tx => tx.id);

    if (selectedTransactions.length === currentTxIds.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(currentTxIds);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedTransactions.length === 0) {
      showPopup('info', 'No Selection', 'Please select transactions to perform bulk action', closePopup);
      return;
    }

    if (action === 'mark_completed') {
      showPopup(
        'warning',
        'Confirm Completion',
        `Mark ${selectedTransactions.length} transaction(s) as completed?`,
        () => {
          console.log('Marking as completed:', selectedTransactions);
          // Here you would update Firestore to mark these as completed
          showPopup('success', 'Marked Completed', `${selectedTransactions.length} transaction(s) marked as completed`, closePopup);
          fetchData(); // Refresh data
          setSelectedTransactions([]);
        },
        closePopup
      );
    } else if (action === 'mark_failed') {
      showPopup(
        'warning',
        'Confirm Failure',
        `Mark ${selectedTransactions.length} transaction(s) as failed?`,
        () => {
          console.log('Marking as failed:', selectedTransactions);
          // Here you would update Firestore to mark these as failed
          showPopup('success', 'Marked Failed', `${selectedTransactions.length} transaction(s) marked as failed`, closePopup);
          fetchData(); // Refresh data
          setSelectedTransactions([]);
        },
        closePopup
      );
    }
  };

  const handleViewTransaction = (transactionId) => {
    navigate(`/admin-transaction/${transactionId}`);
  };

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter !== 'all' && tx.coin !== activeFilter) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      tx.coin?.toLowerCase().includes(searchLower) ||
      tx.userName?.toLowerCase().includes(searchLower) ||
      tx.userId?.toLowerCase().includes(searchLower) ||
      tx.userEmail?.toLowerCase().includes(searchLower) ||
      tx.userPhone?.toLowerCase().includes(searchLower) ||
      tx.status?.toLowerCase().includes(searchLower)
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === 'usd') {
      return sortOrder === 'desc'
        ? b.usdAmount - a.usdAmount
        : a.usdAmount - b.usdAmount;
    } else if (sortBy === 'naira') {
      return sortOrder === 'desc'
        ? b.nairaAmount - a.nairaAmount
        : a.nairaAmount - b.nairaAmount;
    } else if (sortBy === 'coin') {
      return sortOrder === 'desc'
        ? b.coin.localeCompare(a.coin)
        : a.coin.localeCompare(b.coin);
    } else if (sortBy === 'status') {
      return sortOrder === 'desc'
        ? b.status.localeCompare(a.status)
        : a.status.localeCompare(b.status);
    }
    return 0;
  });

  // For coin detail view, get transactions for selected coin
  const coinDetailTransactions = selectedCoin && coinStats[selectedCoin]
    ? coinStats[selectedCoin].transactions
    : [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const coinStatsArray = Object.values(coinStats).sort((a, b) => b.totalUSD - a.totalUSD);

  // Get selected coin stats
  const selectedCoinStats = selectedCoin ? coinStats[selectedCoin] : null;

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) return 'bg-yellow-500/20 text-yellow-400';
    if (statusLower.includes('processing')) return 'bg-blue-500/20 text-blue-400';
    if (statusLower.includes('awaiting')) return 'bg-orange-500/20 text-orange-400';
    if (statusLower.includes('review')) return 'bg-purple-500/20 text-purple-400';
    return 'bg-white/10 text-white/70';
  };

  return (
    <div className="bg-[rgb(255,240,120)] min-h-screen flex">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'md:mr-24' : 'md:mr-52'}`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 md:pt-4 pt-24 overflow-auto">
        <CustomPopup popup={popup} onClose={closePopup} />
        {/* Back Button and Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-black/60 hover:text-black font-medium"
          >
            <BsArrowLeft className="w-5 h-5" />
            {viewMode === 'coinDetail' ? 'Back to Overview' : 'Back'}
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-black">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `Pending ${selectedCoin} Sales`
                  : 'Pending Crypto Sales'
                }
              </h1>
              <p className="text-black/60 mt-1 lg:mt-2 text-sm lg:text-base">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `Manage pending ${selectedCoin} sell transactions`
                  : 'Review and manage pending cryptocurrency sales'
                }
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-black text-[rgb(255,240,120)] rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm lg:text-base"
              >
                <BsArrowRepeat className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-yellow-600/30 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsHourglass className="w-4 h-4 text-yellow-800" />
              <span className="text-sm font-medium text-yellow-800">
                {totalStats.transactionCount} Pending Transactions
              </span>
            </div>
            <div className="bg-yellow-600/30 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsCurrencyDollar className="w-4 h-4 text-yellow-800" />
              <span className="text-sm font-medium text-yellow-800">
                {formatUSD(totalStats.totalPendingUSD)} Pending USD
              </span>
            </div>
            <div className="bg-yellow-600/30 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsClock className="w-4 h-4 text-yellow-800" />
              <span className="text-sm font-medium text-yellow-800">
                Oldest: {totalStats.oldestPendingDays}d ago
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm lg:text-base">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Search and Filter */}
          {viewMode === 'overview' && (
            <div className="flex flex-col lg:flex-col gap-3 lg:gap-4 mb-6">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by coin, user, status, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 bg-black text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm lg:text-base"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Coin Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCoinClick('all')}
                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${activeFilter === 'all' && viewMode === 'overview'
                      ? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'
                      : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'
                      }`}
                  >
                    <BsListUl className="w-4 h-4" />
                    All Coins
                  </button>
                  {CRYPTO_COINS.map(coin => (
                    <button
                      key={coin}
                      onClick={() => handleCoinClick(coin)}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${selectedCoin === coin
                        ? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'
                        : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${COIN_ICONS[coin]?.color || 'bg-white/10'}`}>
                        {COIN_ICONS[coin]?.icon || <SiBitcoin className="text-xs" />}
                      </div>
                      {coin}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-black text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="usd">Sort by USD</option>
                    <option value="naira">Sort by NGN</option>
                    <option value="coin">Sort by Coin</option>
                    <option value="status">Sort by Status</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-2 bg-black text-white border border-white/20 rounded-lg hover:bg-white/10 flex items-center gap-2 focus:outline-none focus:border-[rgb(255,240,120)] text-sm"
                  >
                    {sortOrder === 'desc' ? <BsArrowDown /> : <BsArrowUp />}
                    <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Desc' : 'Asc'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedTransactions.length > 0 && (
          <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-[rgb(255,240,120)] font-medium">
                  {selectedTransactions.length} transaction(s) selected
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('mark_completed')}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 font-medium text-sm flex items-center gap-2"
                >
                  <BsCheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
                <button
                  onClick={() => handleBulkAction('mark_failed')}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 font-medium text-sm flex items-center gap-2"
                >
                  <BsXCircle className="w-4 h-4" />
                  Mark as Failed
                </button>
                <button
                  onClick={() => setSelectedTransactions([])}
                  className="px-4 py-2 bg-white/10 text-white/60 rounded-lg hover:bg-white/20 font-medium text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Coin Dashboard (When a coin is clicked) */}
        {viewMode === 'coinDetail' && selectedCoinStats && (
          <div className="mb-8">
            {/* Coin Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${COIN_ICONS[selectedCoin]?.color || 'bg-white/10'}`}>
                {COIN_ICONS[selectedCoin]?.icon || <SiBitcoin className="text-2xl" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Pending {selectedCoin} Sales</h2>
                <p className="text-black/60">
                  {selectedCoinStats.transactionCount} pending transactions • {formatUSD(selectedCoinStats.totalUSD)} total pending
                </p>
              </div>
            </div>

            {/* Coin-specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Pending USD Value</p>
                    <p className="text-2xl font-bold text-black mt-2">
                      {formatUSD(selectedCoinStats.totalUSD)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedCoinStats.transactionCount} transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCurrencyDollar className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Pending NGN Value</p>
                    <p className="text-2xl font-bold text-black mt-2">
                      {formatCurrency(selectedCoinStats.totalNGN)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Avg: {formatCurrency(selectedCoinStats.totalNGN / selectedCoinStats.transactionCount || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCashCoin className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Pending Crypto</p>
                    <p className="text-2xl font-bold text-black mt-2">
                      {formatCrypto(selectedCoinStats.totalCrypto, selectedCoin)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Total {selectedCoin} pending
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsExclamationCircle className="w-6 h-6 text-[rgb(255,240,120)]" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Oldest Pending</p>
                    <p className="text-2xl font-bold text-black mt-2">
                      {formatTimeAgo(selectedCoinStats.oldestTransaction)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Avg Rate: ₦{selectedCoinStats.avgRate?.toFixed(2)}/$
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsClock className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview (Only in overview mode) */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            {[
              {
                title: "Pending Transactions",
                value: totalStats.transactionCount,
                subtext: `${coinStatsArray.length} coins pending`,
                bgColor: "bg-white/10",
                textColor: "text-yellow-400",
                icon: <BsHourglass className="w-6 h-6 text-yellow-400" />
              },
              {
                title: "Pending USD Value",
                value: formatUSD(totalStats.totalPendingUSD),
                subtext: "Total USD awaiting completion",
                bgColor: "bg-white/10",
                textColor: "text-[rgb(255,240,120)]",
                icon: <BsCurrencyDollar className="w-6 h-6 text-[rgb(255,240,120)]" />
              },
              {
                title: "Pending NGN Value",
                value: formatCurrency(totalStats.totalPendingNGN),
                subtext: "Total NGN awaiting payment",
                bgColor: "bg-white/10",
                textColor: "text-orange-400",
                icon: <BsCashCoin className="w-6 h-6 text-orange-400" />
              },
              {
                title: "Oldest Pending",
                value: `${totalStats.oldestPendingDays}d ago`,
                subtext: "Time since oldest pending transaction",
                bgColor: "bg-white/10",
                textColor: "text-purple-400",
                icon: <BsClock className="w-6 h-6 text-purple-400" />
              }
            ].map((stat, index) => (
              <div key={index} className="bg-black rounded-xl p-4 lg:p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs lg:text-sm font-medium">{stat.title}</p>
                    <p className="text-lg lg:text-2xl font-bold text-black mt-1 lg:mt-2 truncate">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {stat.subtext}
                    </p>
                  </div>
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coin Performance (Only in overview mode) */}
        {viewMode === 'overview' && coinStatsArray.length > 0 && (
          <div className="mb-6 lg:mb-8">
            <h3 className="text-lg font-semibold text-black mb-3 lg:mb-4">Pending by Coin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {coinStatsArray.map((coin) => (
                <div
                  key={coin.coin}
                  className="bg-black rounded-lg p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  onClick={() => handleCoinClick(coin.coin)}
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${COIN_ICONS[coin.coin]?.color || 'bg-white/10'}`}>
                        {COIN_ICONS[coin.coin]?.icon || <SiBitcoin className="text-lg lg:text-xl" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base lg:text-lg">{coin.coin}</h4>
                        <p className="text-xs text-white/40">{coin.transactionCount} pending</p>
                      </div>
                    </div>
                    <BsArrowRight className="w-4 h-4 text-white/40" />
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Pending USD</p>
                      <p className="font-semibold text-[rgb(255,240,120)] text-sm lg:text-base">{formatUSD(coin.totalUSD)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 mb-1">Pending NGN</p>
                      <p className="font-semibold text-green-400 text-sm lg:text-base">{formatCurrency(coin.totalNGN)}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/40">Pending Crypto</p>
                        <p className="text-xs lg:text-sm font-medium text-white">{formatCrypto(coin.totalCrypto, coin.coin)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Oldest</p>
                        <p className="text-xs lg:text-sm font-medium text-purple-400">
                          {formatTimeAgo(coin.oldestTransaction)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-black rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-lg font-semibold text-[rgb(255,240,120)]">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `Pending ${selectedCoin} Sales (${coinDetailTransactions.length})`
                  : `Pending Transactions (${sortedTransactions.length})`
                }
              </h3>
              {transactions.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-[rgb(255,240,120)] hover:opacity-80 font-medium"
                  >
                    {selectedTransactions.length === currentTransactions.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <div className="hidden sm:block">
                    <span className="text-sm text-white/40">
                      Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-8 lg:py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-[rgb(255,240,120)] mx-auto"></div>
              <p className="text-white/40 mt-3 lg:mt-4">Loading pending transactions...</p>
            </div>
          ) : (viewMode === 'coinDetail' ? coinDetailTransactions : sortedTransactions).length === 0 ? (
            <div className="py-8 lg:py-12 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <BsCheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mt-3 lg:mt-4">No pending transactions</h3>
              <p className="text-white/40 mt-1 text-sm lg:text-base">
                {searchTerm || activeFilter !== 'all' || viewMode === 'coinDetail'
                  ? `No transactions match your filters`
                  : 'All transactions are completed!'
                }
              </p>
              <button
                onClick={fetchData}
                className="mt-3 lg:mt-4 px-4 py-2 bg-[rgb(255,240,120)] text-black rounded-lg hover:opacity-90 font-medium text-sm lg:text-base"
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-white/5">
                  {(viewMode === 'coinDetail' ? coinDetailTransactions : currentTransactions).map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(tx.id)}
                            onChange={() => handleTransactionSelect(tx.id)}
                            className="h-4 w-4 accent-[rgb(255,240,120)] rounded border-white/20"
                          />
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${COIN_ICONS[tx.coin]?.color || 'bg-white/10'}`}>
                            {COIN_ICONS[tx.coin]?.icon || <SiBitcoin className="text-xl" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">{tx.coin}</div>
                            <div className="text-xs text-white/40">{tx.userName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(tx.status)}`}>
                            {tx.status}
                          </span>
                          <div className="text-xs text-white/40 mt-1">{formatTimeAgo(tx.timestamp)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-white/40">Crypto Amount</div>
                          <div className="font-medium">{formatCrypto(tx.cryptoAmount, tx.coin)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">USD Value</div>
                          <div className="font-semibold text-[rgb(255,240,120)]">{formatUSD(tx.usdAmount)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">NGN Value</div>
                          <div className="font-semibold text-green-400">{formatCurrency(tx.nairaAmount)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Rate</div>
                          <div>₦{tx.rate?.toFixed(2)}/$</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => handleViewTransaction(tx.id)}
                          className="w-full px-4 py-2 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-lg text-sm font-medium"
                        >
                          Review Transaction
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.length === currentTransactions.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 accent-[rgb(255,240,120)] rounded border-white/20"
                        />
                      </th>
                      {viewMode === 'overview' && (
                        <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                          Coin
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Crypto Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        USD Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        NGN Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Time Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(viewMode === 'coinDetail' ? coinDetailTransactions : currentTransactions).map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(tx.id)}
                            onChange={() => handleTransactionSelect(tx.id)}
                            className="h-4 w-4 accent-[rgb(255,240,120)] rounded border-white/20"
                          />
                        </td>
                        {viewMode === 'overview' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${COIN_ICONS[tx.coin]?.color || 'bg-white/10'}`}>
                                  {COIN_ICONS[tx.coin]?.icon || <SiBitcoin className="text-xl" />}
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-white">{tx.coin}</div>
                                <div className="text-xs text-white/40">Sell</div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{tx.userName}</div>
                          <div className="text-xs text-white/40">
                            {tx.userEmail || tx.userPhone || 'No contact info'}
                          </div>
                          <div className="text-xs text-white/40 truncate max-w-[120px]">
                            ID: {tx.userId?.slice(0, 10)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {formatCrypto(tx.cryptoAmount, tx.coin)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[rgb(255,240,120)]">
                            {formatUSD(tx.usdAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-400">
                            {formatCurrency(tx.nairaAmount)}
                          </div>
                          <div className="text-xs text-white/40">
                            Rate: ₦{tx.rate?.toFixed(2)}/$
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {formatTimeAgo(tx.timestamp)}
                          </div>
                          <div className="text-xs text-white/40">
                            {formatDate(tx.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewTransaction(tx.id)}
                              className="px-3 py-1 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-md text-sm font-medium"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination (Only in overview mode and when pagination is needed) */}
              {viewMode === 'overview' && totalPages > 1 && (
                <div className="px-4 lg:px-6 py-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-white/40">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        <BsChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg ${currentPage === pageNum
                              ? 'bg-[rgb(255,240,120)] text-black font-bold'
                              : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                      >
                        <BsChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-black rounded-lg border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-medium text-white">Pending Transactions Information</h4>
              <p className="text-sm text-white/60 mt-1">
                Review and manage pending cryptocurrency sell transactions. Select transactions to perform bulk actions.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-white/60">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-white/60">Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-white/60">Awaiting Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingCoinsSold;