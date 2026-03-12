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
  BsHourglass,
  BsExclamationTriangle,
  BsFileEarmarkText
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import usePopup from './usePopup';
import CustomPopup from './CustomPopup';

const COIN_ICONS = {
  BTC: { icon: <SiBitcoin className="text-2xl" />, color: "bg-orange-100 text-orange-600" },
  ETH: { icon: <SiEthereum className="text-2xl" />, color: "bg-indigo-100 text-indigo-600" },
  USDT: { icon: <SiTether className="text-2xl" />, color: "bg-green-100 text-green-600" },
  USDC: { icon: <SiTether className="text-2xl" />, color: "bg-blue-100 text-blue-600" },
  TRX: { icon: <img src={trxIcon} alt="TRX" className="w-6 h-6" />, color: "bg-red-100 text-red-600" },
  BCH: { icon: <SiBitcoincash className="text-2xl" />, color: "bg-cyan-100 text-cyan-600" },
  DASH: { icon: <SiDash className="text-2xl" />, color: "bg-gray-100 text-gray-600" },
  LTC: { icon: <SiLitecoin className="text-2xl" />, color: "bg-blue-100 text-blue-600" },
  BNB: { icon: <SiBinance className="text-2xl" />, color: "bg-yellow-100 text-yellow-600" },
  XRP: { icon: <SiRipple className="text-2xl" />, color: "bg-gray-800 text-gray-100" },
  DOGE: { icon: <SiDogecoin className="text-2xl" />, color: "bg-yellow-100 text-yellow-600" },
  BUSD: { icon: <SiBinance className="text-2xl" />, color: "bg-yellow-50 text-yellow-500" },
};

const CRYPTO_COINS = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'TRX', 'BCH', 'BNB', 'DASH', 'XRP', 'DOGE', 'BUSD'];

const FailedCoinsSold = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [coinStats, setCoinStats] = useState({});
  const [userMap, setUserMap] = useState({});
  const [totalStats, setTotalStats] = useState({
    totalFailedUSD: 0,
    totalFailedNGN: 0,
    totalFailedCrypto: 0,
    transactionCount: 0,
    recentFailedDays: 0
  });
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedTransactionReason, setSelectedTransactionReason] = useState(null);
  const [failureReasons, setFailureReasons] = useState({});

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

  const fetchFailedTransactions = useCallback(async (userMapData = {}) => {
    try {
      setLoading(true);
      setError(null);

      let q;
      let hasOrderBy = false;

      try {
        // Query for failed sell transactions
        q = query(
          collection(db, 'transactionHistory'),
          where('status', 'in', ['Failed', 'Cancelled', 'Rejected', 'Expired', 'Payment Failed']),
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

      console.log("Failed transactions query snapshot size:", snap.size);

      const rows = [];
      const stats = {};
      const reasons = {};
      let totalFailedUSD = 0;
      let totalFailedNGN = 0;
      let totalFailedCrypto = 0;
      let mostRecentTimestamp = new Date(0);
      let now = new Date();

      snap.forEach(doc => {
        try {
          const tx = doc.data();
          const coin = tx.coin?.toUpperCase();

          if (!coin || !CRYPTO_COINS.includes(coin)) return;

          // Filter for failed status transactions
          const status = tx.status?.toLowerCase() || '';
          if (!['failed', 'cancelled', 'rejected', 'expired', 'payment failed'].includes(status)) {
            return;
          }

          const usdAmount = Number(tx.amount || 0);
          const rate = Number(tx.rate || 1);
          const nairaAmount = Number(tx.nairaValue || (usdAmount * rate));
          const cryptoAmount = Number(tx.cryptoAmount || (rate > 0 ? usdAmount / rate : usdAmount));
          const timestamp = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || Date.now());
          const failureReason = tx.failureReason || tx.cancellationReason || 'No reason provided';
          const failedBy = tx.failedBy || tx.cancelledBy || 'System';
          const failedAt = tx.failedAt?.toDate ? tx.failedAt.toDate() : tx.updatedAt?.toDate ? tx.updatedAt.toDate() : timestamp;

          // Track most recent failed transaction
          if (timestamp > mostRecentTimestamp) {
            mostRecentTimestamp = timestamp;
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
              mostRecentFailure: timestamp,
              commonReasons: {},
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

          if (timestamp > stats[coin].mostRecentFailure) {
            stats[coin].mostRecentFailure = timestamp;
          }

          // Track common failure reasons
          if (!stats[coin].commonReasons[failureReason]) {
            stats[coin].commonReasons[failureReason] = 0;
          }
          stats[coin].commonReasons[failureReason] += 1;

          // Store failure reason for this transaction
          reasons[doc.id] = {
            reason: failureReason,
            failedBy: failedBy,
            failedAt: failedAt
          };

          // Store transaction for this coin
          const transactionData = {
            id: doc.id,
            coin,
            usdAmount,
            cryptoAmount,
            nairaAmount,
            rate,
            timestamp,
            failedAt,
            status: tx.status,
            type: tx.type,
            userId: tx.userId,
            userName: userMapData[tx.userId] || "Unknown User",
            userEmail: tx.userEmail || '',
            userPhone: tx.userPhone || '',
            paymentMethod: tx.paymentMethod || 'Bank Transfer',
            paymentDetails: tx.paymentDetails || {},
            notes: tx.notes || '',
            failureReason: failureReason,
            failedBy: failedBy,
            expectedDelivery: tx.expectedDelivery || '',
            createdAt: timestamp
          };
          stats[coin].transactions.push(transactionData);

          // Add to global totals
          totalFailedUSD += usdAmount;
          totalFailedNGN += nairaAmount;
          totalFailedCrypto += cryptoAmount;

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

      // Calculate days since most recent failed transaction
      const recentFailedDays = mostRecentTimestamp > new Date(0)
        ? Math.floor((now - mostRecentTimestamp) / (1000 * 60 * 60 * 24))
        : 0;

      setTransactions(rows);
      setCoinStats(stats);
      setFailureReasons(reasons);
      setTotalStats({
        totalFailedUSD,
        totalFailedNGN,
        totalFailedCrypto,
        transactionCount: rows.length,
        recentFailedDays
      });

      console.log("Loaded failed transactions:", rows.length);

    } catch (e) {
      console.error("Error fetching failed transactions:", e);
      setError(`Failed to load failed transactions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await fetchUsers();
      await fetchFailedTransactions(userData);
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

    if (action === 'restore') {
      showPopup(
        'warning',
        'Confirm Restore',
        `Restore ${selectedTransactions.length} failed transaction(s)? This will set them to pending.`,
        () => {
          console.log('Restoring transactions:', selectedTransactions);
          // Here you would update Firestore to restore these transactions
          showPopup('success', 'Restored', `${selectedTransactions.length} transaction(s) restored to pending`, closePopup);
          fetchData(); // Refresh data
          setSelectedTransactions([]);
        },
        closePopup
      );
    } else if (action === 'delete') {
      showPopup(
        'warning',
        'Confirm Delete',
        `Permanently delete ${selectedTransactions.length} failed transaction(s)? This action cannot be undone.`,
        () => {
          console.log('Deleting transactions:', selectedTransactions);
          // Here you would delete from Firestore
          showPopup('success', 'Deleted', `${selectedTransactions.length} transaction(s) deleted`, closePopup);
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

  const handleViewReason = (transactionId) => {
    setSelectedTransactionReason(failureReasons[transactionId]);
    setShowReasonModal(true);
  };

  const handleRetryTransaction = (transactionId) => {
    showPopup(
      'info',
      'Confirm Retry',
      'Retry this failed transaction? This will create a new pending transaction.',
      () => {
        console.log('Retrying transaction:', transactionId);
        // Here you would create a new pending transaction based on the failed one
        showPopup('info', 'Queued', 'Transaction queued for retry', closePopup);
        fetchData();
        closePopup();
      },
      closePopup
    );
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
      tx.status?.toLowerCase().includes(searchLower) ||
      tx.failureReason?.toLowerCase().includes(searchLower)
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
    if (statusLower.includes('failed') || statusLower.includes('payment failed')) return 'bg-red-100 text-red-800';
    if (statusLower.includes('cancelled')) return 'bg-gray-100 text-gray-800';
    if (statusLower.includes('rejected')) return 'bg-purple-100 text-purple-800';
    if (statusLower.includes('expired')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get most common failure reason for a coin
  const getMostCommonReason = (coinStat) => {
    if (!coinStat || !coinStat.commonReasons) return 'No reasons recorded';
    const reasons = Object.entries(coinStat.commonReasons);
    if (reasons.length === 0) return 'No reasons recorded';
    reasons.sort((a, b) => b[1] - a[1]);
    return reasons[0][0];
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
                  ? `Failed ${selectedCoin} Sales`
                  : 'Failed Crypto Sales'
                }
              </h1>
              <p className="text-black/60 mt-1 lg:mt-2 text-sm lg:text-base">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `Review failed ${selectedCoin} sell transactions and reasons`
                  : 'Review failed cryptocurrency sales and failure analysis'
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
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsExclamationTriangle className="w-4 h-4 text-red-700" />
              <span className="text-sm font-medium text-red-700">
                {totalStats.transactionCount} Failed Transactions
              </span>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsCurrencyDollar className="w-4 h-4 text-red-700" />
              <span className="text-sm font-medium text-red-700">
                Lost Value: {formatUSD(totalStats.totalFailedUSD)}
              </span>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsClock className="w-4 h-4 text-red-700" />
              <span className="text-sm font-medium text-red-700">
                Most Recent: {totalStats.recentFailedDays > 0 ? `${totalStats.recentFailedDays}d ago` : 'No failures'}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm lg:text-base">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
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
                  placeholder="Search by coin, user, status, failure reason..."
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
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-blue-700 font-medium">
                  {selectedTransactions.length} failed transaction(s) selected
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('restore')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2"
                >
                  <BsCheckCircle className="w-4 h-4" />
                  Restore to Pending
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2"
                >
                  <BsXCircle className="w-4 h-4" />
                  Delete Permanently
                </button>
                <button
                  onClick={() => setSelectedTransactions([])}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
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
                <h2 className="text-2xl font-bold text-black">Failed {selectedCoin} Sales</h2>
                <p className="text-black/60">
                  {selectedCoinStats.transactionCount} failed transactions • {formatUSD(selectedCoinStats.totalUSD)} total lost value
                </p>
              </div>
            </div>

            {/* Coin-specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Lost USD Value</p>
                    <p className="text-2xl font-bold text-red-400 mt-2">
                      {formatUSD(selectedCoinStats.totalUSD)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedCoinStats.transactionCount} failed transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCurrencyDollar className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Lost NGN Value</p>
                    <p className="text-2xl font-bold text-red-400 mt-2">
                      {formatCurrency(selectedCoinStats.totalNGN)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Avg: {formatCurrency(selectedCoinStats.totalNGN / selectedCoinStats.transactionCount || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCashCoin className="w-6 h-6 text-[rgb(255,240,120)]" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Failed Crypto</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {formatCrypto(selectedCoinStats.totalCrypto, selectedCoin)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Total {selectedCoin} failed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsExclamationCircle className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Most Common Reason</p>
                    <p className="text-xl font-bold text-white mt-2 truncate">
                      {getMostCommonReason(selectedCoinStats)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Last: {formatTimeAgo(selectedCoinStats.mostRecentFailure)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsFileEarmarkText className="w-6 h-6 text-white/40" />
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
                title: "Failed Transactions",
                value: totalStats.transactionCount,
                subtext: `${coinStatsArray.length} coins with failures`,
                bgColor: "bg-white/10",
                textColor: "text-red-400",
                icon: <BsExclamationTriangle className="w-6 h-6 text-red-400" />
              },
              {
                title: "Lost USD Value",
                value: formatUSD(totalStats.totalFailedUSD),
                subtext: "Total USD value lost",
                bgColor: "bg-white/10",
                textColor: "text-red-400",
                icon: <BsCurrencyDollar className="w-6 h-6 text-red-400" />
              },
              {
                title: "Lost NGN Value",
                value: formatCurrency(totalStats.totalFailedNGN),
                subtext: "Total NGN value lost",
                bgColor: "bg-white/10",
                textColor: "text-[rgb(255,240,120)]",
                icon: <BsCashCoin className="w-6 h-6 text-[rgb(255,240,120)]" />
              },
              {
                title: "Most Recent Failure",
                value: `${totalStats.recentFailedDays}d ago`,
                subtext: "Time since last failed transaction",
                bgColor: "bg-white/10",
                textColor: "text-purple-400",
                icon: <BsClock className="w-6 h-6 text-purple-400" />
              }
            ].map((stat, index) => (
              <div key={index} className="bg-black rounded-xl p-4 lg:p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs lg:text-sm font-medium">{stat.title}</p>
                    <p className={`text-lg lg:text-2xl font-bold ${stat.textColor} mt-1 lg:mt-2 truncate`}>
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

        {/* Failure Reasons Analysis (Only in overview mode) */}
        {viewMode === 'overview' && coinStatsArray.length > 0 && (
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-lg font-semibold text-black">Failure Analysis by Coin</h3>
              <div className="flex items-center gap-2">
                <BsXCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-black/40">{totalStats.transactionCount} total failures</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {coinStatsArray.map((coin) => {
                const commonReasons = Object.entries(coin.commonReasons || {});
                const topReason = commonReasons.sort((a, b) => b[1] - a[1])[0];

                return (
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
                          <p className="text-xs text-white/40 flex items-center gap-1">
                            <BsXCircle className="w-3 h-3 text-red-500" />
                            {coin.transactionCount} failed
                          </p>
                        </div>
                      </div>
                      <BsArrowRight className="w-4 h-4 text-white/40" />
                    </div>

                    <div className="space-y-2 lg:space-y-3">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Lost USD</p>
                        <p className="font-semibold text-red-400 text-sm lg:text-base">{formatUSD(coin.totalUSD)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 mb-1">Lost NGN</p>
                        <p className="font-semibold text-[rgb(255,240,120)] text-sm lg:text-base">{formatCurrency(coin.totalNGN)}</p>
                      </div>

                      <div>
                        <p className="text-xs text-white/40 mb-1">Top Failure Reason</p>
                        <p className="text-xs lg:text-sm font-medium text-white truncate">
                          {topReason ? `${topReason[0]} (${topReason[1]})` : 'No reasons recorded'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <div>
                          <p className="text-xs text-white/40">Failed Crypto</p>
                          <p className="text-xs lg:text-sm font-medium text-white">{formatCrypto(coin.totalCrypto, coin.coin)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40">Last Failure</p>
                          <p className="text-xs lg:text-sm font-medium text-purple-400">
                            {formatTimeAgo(coin.mostRecentFailure)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-black rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[rgb(255,240,120)]">
                  {viewMode === 'coinDetail' && selectedCoin
                    ? `Failed ${selectedCoin} Sales (${coinDetailTransactions.length})`
                    : `Failed Transactions (${sortedTransactions.length})`
                  }
                </h3>
                <div className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
                  <BsXCircle className="w-3 h-3" />
                  Failed
                </div>
              </div>
              {transactions.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-[rgb(255,240,120)] hover:text-white font-medium"
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
              <p className="text-white/40 mt-3 lg:mt-4">Loading failed transactions...</p>
            </div>
          ) : (viewMode === 'coinDetail' ? coinDetailTransactions : sortedTransactions).length === 0 ? (
            <div className="py-8 lg:py-12 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <BsCheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mt-3 lg:mt-4">No failed transactions</h3>
              <p className="text-white/40 mt-1 text-sm lg:text-base">
                {searchTerm || activeFilter !== 'all' || viewMode === 'coinDetail'
                  ? `No transactions match your filters`
                  : 'All transactions are successful!'
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
                    <div key={tx.id} className="p-4 hover:bg-white/5 cursor-pointer" onClick={() => handleViewTransaction(tx.id)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(tx.id)}
                            onChange={(e) => { e.stopPropagation(); handleTransactionSelect(tx.id); }}
                            className="h-4 w-4 text-[rgb(255,240,120)] rounded border-white/20 bg-black"
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
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400`}>
                            {tx.status}
                          </span>
                          <div className="text-xs text-white/40 mt-1">{formatTimeAgo(tx.timestamp)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <div className="text-white/40">Crypto Amount</div>
                          <div className="font-medium text-white">{formatCrypto(tx.cryptoAmount, tx.coin)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">USD Value</div>
                          <div className="font-semibold text-red-400">{formatUSD(tx.usdAmount)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">NGN Value</div>
                          <div className="font-semibold text-[rgb(255,240,120)]">{formatCurrency(tx.nairaAmount)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Rate</div>
                          <div className="text-white">₦{tx.rate?.toFixed(2)}/$</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-white/40 mb-1">Failure Reason</div>
                        <div className="text-sm font-medium text-red-400 bg-red-900/20 p-2 rounded truncate">
                          {tx.failureReason}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewReason(tx.id); }}
                          className="flex-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-sm font-medium"
                        >
                          View Reason
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewTransaction(tx.id); }}
                          className="flex-1 px-4 py-2 bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)] hover:bg-white/5 rounded-lg text-sm font-medium"
                        >
                          Details
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
                          className="h-4 w-4 text-[rgb(255,240,120)] rounded border-white/20 bg-black"
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
                        Failure Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Failed At
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
                            className="h-4 w-4 text-[rgb(255,240,120)] rounded border-white/20 bg-black"
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
                          <div className="text-sm font-semibold text-red-400">
                            {formatUSD(tx.usdAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[rgb(255,240,120)]">
                            {formatCurrency(tx.nairaAmount)}
                          </div>
                          <div className="text-xs text-white/40">
                            Rate: ₦{tx.rate?.toFixed(2)}/$
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-red-400 font-medium truncate max-w-[200px]" title={tx.failureReason}>
                            {truncateText(tx.failureReason || 'Failed', 60)}
                          </div>
                          <div className="text-xs text-white/40">
                            By: {tx.failedBy}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/40">
                            {formatTimeAgo(tx.failedAt || tx.timestamp)}
                          </div>
                          <div className="text-xs text-white/40">
                            {formatDate(tx.failedAt || tx.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewReason(tx.id)}
                              className="px-3 py-1 bg-white/10 text-white hover:bg-white/20 rounded-md text-sm font-medium"
                            >
                              Reason
                            </button>
                            <button
                              onClick={() => handleViewTransaction(tx.id)}
                              className="px-3 py-1 bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)] hover:bg-white/5 rounded-md text-sm font-medium"
                            >
                              Details
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
                              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
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
        {transactions.length > 0 && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-medium text-red-400">Failed Transactions Summary</h4>
                <p className="text-sm text-red-400">
                  Total {totalStats.transactionCount} failed transactions • {formatUSD(totalStats.totalFailedUSD)} USD • {formatCurrency(totalStats.totalFailedNGN)} NGN
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-[rgb(255,240,120)]">{coinStatsArray.length}</div>
                  <div className="text-xs text-[rgb(255,240,120)]">Coins Failed</div>
                </div>
                <div className="h-8 w-px bg-red-500/30"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {totalStats.transactionCount > 0
                      ? formatUSD(totalStats.totalFailedUSD / totalStats.transactionCount)
                      : formatUSD(0)
                    }
                  </div>
                  <div className="text-xs text-purple-400">Avg Failed Sale</div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-500/30">
              <p className="text-xs text-red-400">
                ⚠️ These transactions failed and need investigation. Check failure reasons for patterns.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FailedCoinsSold;