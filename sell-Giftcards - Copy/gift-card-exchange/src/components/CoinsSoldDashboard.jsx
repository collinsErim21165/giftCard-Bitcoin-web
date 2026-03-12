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
  BsListUl
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

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

const CoinsSoldDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [coinStats, setCoinStats] = useState({});
  const [userMap, setUserMap] = useState({});
  const [totalStats, setTotalStats] = useState({
    totalUsdVolume: 0,
    totalNairaRevenue: 0,
    transactionCount: 0,
    totalPlatformRevenue: 0
  });
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'coinDetail'

  const navigate = useNavigate();

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

  const fetchCoinTransactions = useCallback(async (userMapData = {}) => {
    try {
      setLoading(true);
      setError(null);

      let q;
      let hasOrderBy = false;

      try {
        q = query(
          collection(db, 'transactionHistory'),
          where('status', '==', 'Completed'),
          where('type', '==', 'sell'),
          orderBy('createdAt', 'desc')
        );
        hasOrderBy = true;
      } catch (indexError) {
        console.log("Index error, using simpler query:", indexError);
        if (indexError.code === 'failed-precondition') {
          setError("Database index is being created. Please wait a few minutes and refresh.");
        }
        q = query(
          collection(db, 'transactionHistory'),
          where('status', '==', 'Completed'),
          where('type', '==', 'sell')
        );
        hasOrderBy = false;
      }

      const snap = await getDocs(q);

      const rows = [];
      const stats = {};
      let totalUsd = 0;
      let totalNgn = 0;
      let totalCommission = 0;

      snap.forEach(doc => {
        try {
          const tx = doc.data();
          const coin = tx.coin?.toUpperCase();

          if (!coin || !CRYPTO_COINS.includes(coin)) return;

          const usdAmount = Number(tx.amount || 0);
          const rate = Number(tx.rate || 1);
          const nairaAmount = Number(tx.nairaValue || (usdAmount * rate));
          const platformRevenue = Number(tx.platformRevenue || 0);
          const cryptoAmount = rate > 0 ? usdAmount / rate : usdAmount;

          if (!stats[coin]) {
            stats[coin] = {
              coin,
              totalUsd: 0,
              totalNaira: 0,
              totalCrypto: 0,
              totalPlatformRevenue: 0,
              transactionCount: 0,
              avgRate: 0,
              rateCount: 0,
              transactions: []
            };
          }

          stats[coin].totalUsd += usdAmount;
          stats[coin].totalNaira += nairaAmount;
          stats[coin].totalCrypto += cryptoAmount;
          stats[coin].totalPlatformRevenue += platformRevenue;
          stats[coin].transactionCount += 1;
          stats[coin].rateCount += 1;
          stats[coin].avgRate = stats[coin].avgRate + (rate - stats[coin].avgRate) / stats[coin].rateCount;

          const timestamp = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || Date.now());
          const transactionData = {
            id: doc.id,
            coin,
            usdAmount,
            cryptoAmount,
            nairaAmount,
            platformRevenue,
            rate,
            timestamp,
            userId: tx.userId,
            userName: userMapData[tx.userId] || "Unknown User",
            status: tx.status || 'Completed',
            type: tx.type || 'sell'
          };
          stats[coin].transactions.push(transactionData);

          totalUsd += usdAmount;
          totalNgn += nairaAmount;
          totalCommission += platformRevenue;

          rows.push(transactionData);
        } catch (docError) {
          console.error("Error processing document:", doc.id, docError);
        }
      });

      if (!hasOrderBy && rows.length > 0) {
        rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      Object.values(stats).forEach(coinStat => {
        coinStat.transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      setTransactions(rows);
      setCoinStats(stats);
      setTotalStats({
        totalUsdVolume: totalUsd,
        totalNairaRevenue: totalNgn,
        totalPlatformRevenue: totalCommission,
        transactionCount: rows.length
      });

    } catch (e) {
      console.error("Error fetching transactions:", e);
      setError(`Failed to load transactions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await fetchUsers();
      await fetchCoinTransactions(userData);
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

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter !== 'all' && tx.coin !== activeFilter) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      tx.coin?.toLowerCase().includes(searchLower) ||
      tx.userName?.toLowerCase().includes(searchLower) ||
      tx.userId?.toLowerCase().includes(searchLower)
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
    }
    return 0;
  });

  const coinDetailTransactions = selectedCoin && coinStats[selectedCoin]
    ? coinStats[selectedCoin].transactions
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const coinStatsArray = Object.values(coinStats).sort((a, b) => b.totalUsd - a.totalUsd);

  const selectedCoinStats = selectedCoin ? coinStats[selectedCoin] : null;

  return (
    <div className="bg-[rgb(255,240,120)] min-h-screen flex">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'md:mr-24' : 'md:mr-52'}`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 md:pt-4 pt-24 overflow-auto">
        {/* Back Button and Header */}
        <div className="mb-6 lg:mb-8">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-black/60 hover:text-black font-medium transition-colors"
          >
            <BsArrowLeft className="w-5 h-5" />
            {viewMode === 'coinDetail' ? 'Back to Overview' : 'Back'}
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-black">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `${selectedCoin} Sales Dashboard`
                  : 'Coins Sold Dashboard'
                }
              </h1>
              <p className="text-black/60 mt-1 lg:mt-2 text-sm lg:text-base">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `Detailed performance and transactions for ${selectedCoin}`
                  : 'Track all cryptocurrency sales and revenue'
                }
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-black text-[rgb(255,240,120)] rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm lg:text-base"
              >
                <BsArrowRepeat className="w-4 h-4" />
                Refresh Data
              </button>
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
                  placeholder="Search by coin, user name, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 bg-black text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] transition-all text-sm lg:text-base"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCoinClick('all')}
                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${
                      activeFilter === 'all' && viewMode === 'overview'
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
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${
                        selectedCoin === coin
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

        {/* Selected Coin Dashboard (When a coin is clicked) */}
        {viewMode === 'coinDetail' && selectedCoinStats && (
          <div className="mb-8">
            {/* Coin Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${COIN_ICONS[selectedCoin]?.color || 'bg-white/10'}`}>
                {COIN_ICONS[selectedCoin]?.icon || <SiBitcoin className="text-2xl" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{selectedCoin} Performance</h2>
                <p className="text-black/60">{selectedCoinStats.transactionCount} sales • {formatUSD(selectedCoinStats.totalUsd)} total volume</p>
              </div>
            </div>

            {/* Coin-specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Total Volume (USD)</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {formatUSD(selectedCoinStats.totalUsd)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedCoinStats.transactionCount} transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCurrencyDollar className="w-6 h-6 text-[rgb(255,240,120)]" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Total Revenue (NGN)</p>
                    <p className="text-2xl font-bold text-green-400 mt-2">
                      {formatCurrency(selectedCoinStats.totalNaira)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Avg: {formatCurrency(selectedCoinStats.totalNaira / selectedCoinStats.transactionCount || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCashCoin className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Platform Revenue</p>
                    <p className="text-2xl font-bold text-green-400 mt-2">
                      {formatCurrency(selectedCoinStats.totalPlatformRevenue)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedCoinStats.totalUsd > 0
                        ? `${((selectedCoinStats.totalPlatformRevenue / selectedCoinStats.totalNaira) * 100).toFixed(2)}% of revenue`
                        : 'Commission'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsPercent className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Avg Sale Value</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {selectedCoinStats.transactionCount > 0
                        ? formatUSD(selectedCoinStats.totalUsd / selectedCoinStats.transactionCount)
                        : formatUSD(0)
                      }
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Avg Rate: ₦{selectedCoinStats.avgRate?.toFixed(2)}/$
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsGraphUp className="w-6 h-6 text-[rgb(255,240,120)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Crypto Amount Summary */}
            <div className="bg-black rounded-xl p-6 border border-white/10 mb-8">
              <h3 className="text-lg font-semibold text-[rgb(255,240,120)] mb-4">Crypto Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-white/40 text-sm font-medium">Total Crypto Sold</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {formatCrypto(selectedCoinStats.totalCrypto, selectedCoin)}
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Total {selectedCoin} volume
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium">Avg Crypto per Sale</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {selectedCoinStats.transactionCount > 0
                      ? formatCrypto(selectedCoinStats.totalCrypto / selectedCoinStats.transactionCount, selectedCoin)
                      : formatCrypto(0, selectedCoin)
                    }
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Average per transaction
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium">USD to Crypto Ratio</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    1 ${selectedCoin} = ₦{selectedCoinStats.avgRate?.toFixed(2) || '0'}
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Average exchange rate
                  </p>
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
                title: "Total Volume (USD)",
                value: formatUSD(totalStats.totalUsdVolume),
                subtext: `${totalStats.transactionCount} transactions`,
                icon: <BsCurrencyDollar className="w-6 h-6 text-[rgb(255,240,120)]" />,
                valueColor: "text-[rgb(255,240,120)]"
              },
              {
                title: "Total Revenue (NGN)",
                value: formatCurrency(totalStats.totalNairaRevenue),
                subtext: `${coinStatsArray.length} coins`,
                icon: <BsCashCoin className="w-6 h-6 text-green-400" />,
                valueColor: "text-green-400"
              },
              {
                title: "Platform Revenue",
                value: formatCurrency(totalStats.totalPlatformRevenue),
                subtext: "Total commission",
                icon: <BsPercent className="w-6 h-6 text-purple-400" />,
                valueColor: "text-green-400"
              },
              {
                title: "Avg Sale Value",
                value: totalStats.transactionCount > 0
                  ? formatUSD(totalStats.totalUsdVolume / totalStats.transactionCount)
                  : formatUSD(0),
                subtext: "per transaction",
                icon: <BsGraphUp className="w-6 h-6 text-[rgb(255,240,120)]" />,
                valueColor: "text-[rgb(255,240,120)]"
              }
            ].map((stat, index) => (
              <div key={index} className="bg-black rounded-xl p-4 lg:p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs lg:text-sm font-medium">{stat.title}</p>
                    <p className={`text-lg lg:text-2xl font-bold mt-1 lg:mt-2 truncate ${stat.valueColor}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {stat.subtext}
                    </p>
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
            <h3 className="text-lg font-semibold text-black mb-3 lg:mb-4">Coin Performance</h3>
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
                        <p className="text-xs text-white/40">{coin.transactionCount} sales</p>
                      </div>
                    </div>
                    <BsArrowRight className="w-4 h-4 text-white/40" />
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">USD Volume</p>
                      <p className="font-semibold text-[rgb(255,240,120)] text-sm lg:text-base">{formatUSD(coin.totalUsd)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 mb-1">NGN Revenue</p>
                      <p className="font-semibold text-green-400 text-sm lg:text-base">{formatCurrency(coin.totalNaira)}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/40">Avg Rate</p>
                        <p className="text-xs lg:text-sm font-medium text-white">₦{coin.avgRate?.toFixed(2) || '0'}/$</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Commission</p>
                        <p className="text-xs lg:text-sm font-medium text-purple-400">
                          {formatCurrency(coin.totalPlatformRevenue)}
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
                  ? `${selectedCoin} Sales (${coinDetailTransactions.length})`
                  : `Crypto Sales (${sortedTransactions.length})`
                }
              </h3>
              {transactions.length > 0 && (
                <div className="flex items-center gap-4">
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
              <p className="text-white/40 mt-3 lg:mt-4">Loading crypto sales...</p>
            </div>
          ) : (viewMode === 'coinDetail' ? coinDetailTransactions : sortedTransactions).length === 0 ? (
            <div className="py-8 lg:py-12 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <SiBitcoin className="w-6 h-6 lg:w-8 lg:h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white mt-3 lg:mt-4">No crypto sales found</h3>
              <p className="text-white/40 mt-1 text-sm lg:text-base">
                {searchTerm || activeFilter !== 'all' || viewMode === 'coinDetail'
                  ? `No sales match your filters`
                  : 'No completed crypto sell transactions yet'
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
                    <div key={tx.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${COIN_ICONS[tx.coin]?.color || 'bg-white/10'}`}>
                            {COIN_ICONS[tx.coin]?.icon || <SiBitcoin className="text-xl" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">{tx.coin}</div>
                            <div className="text-xs text-white/40">{tx.userName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[rgb(255,240,120)]">{formatUSD(tx.usdAmount)}</div>
                          <div className="text-xs text-white/40">{formatDate(tx.timestamp)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-white/40">Crypto Amount</div>
                          <div className="font-medium text-white">{formatCrypto(tx.cryptoAmount, tx.coin)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">NGN Value</div>
                          <div className="font-semibold text-green-400">{formatCurrency(tx.nairaAmount)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Rate</div>
                          <div className="text-white">₦{tx.rate?.toFixed(2)}/$</div>
                        </div>
                        {tx.platformRevenue > 0 && (
                          <div>
                            <div className="text-white/40">Commission</div>
                            <div className="text-purple-400">+{formatCurrency(tx.platformRevenue)}</div>
                          </div>
                        )}
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
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(viewMode === 'coinDetail' ? coinDetailTransactions : currentTransactions).map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
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
                                <div className="text-xs text-white/40">Sell • {tx.status}</div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{tx.userName}</div>
                          <div className="text-xs text-white/40 truncate max-w-[120px]">
                            {tx.userId?.slice(0, 10)}...
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
                          {tx.platformRevenue > 0 && (
                            <div className="text-xs text-purple-400">
                              +{formatCurrency(tx.platformRevenue)} commission
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            ₦{tx.rate?.toFixed(2)}/$
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/50">
                            {formatDate(tx.timestamp)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination (Only in overview mode) */}
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
                            className={`px-3 py-1 rounded-lg ${
                              currentPage === pageNum
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
      </div>
    </div>
  );
};

export default CoinsSoldDashboard;
