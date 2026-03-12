import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useCryptoRates } from '../hooks/useCryptoRates';
import { db, auth } from '../firebaseConfig';
import { Sidebarpage } from './Sidebarpage';
import { useNavigate } from 'react-router-dom';

// Icons
import {
  BsArrowLeft,
  BsArrowDown,
  BsArrowUp,
  BsSearch,
  BsFilter,
  BsCurrencyDollar,
  BsCashCoin,
  BsGraphUp,
  BsChevronRight,
  BsChevronLeft,
  BsListUl,
  BsClock,
  BsCheckCircle,
  BsXCircle,
  BsArrowDownCircle,
  BsCalendar,
  BsWallet,
  BsClipboard,
  BsLink
} from 'react-icons/bs';

// Coin Icons
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

const COIN_ICONS = {
  BTC: <SiBitcoin className="text-orange-500 text-xl" />,
  ETH: <SiEthereum className="text-indigo-500 text-xl" />,
  USDT: <SiTether className="text-green-500 text-xl" />,
  USDC: <SiTether className="text-blue-500 text-xl" />,
  TRX: <img src={trxIcon} alt="TRX" className="w-5 h-5" />,
  BCH: <SiBitcoincash className="text-cyan-500 text-xl" />,
  DASH: <SiDash className="text-white/60 text-xl" />,
  LTC: <SiLitecoin className="text-blue-500 text-xl" />,
  BNB: <SiBinance className="text-yellow-500 text-xl" />,
  XRP: <SiRipple className="text-white/70 text-xl" />,
  DOGE: <SiDogecoin className="text-yellow-600 text-xl" />,
  BUSD: <SiBinance className="text-yellow-400 text-xl" />,
};

const COIN_NAMES = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  USDC: 'USD Coin',
  TRX: 'TRON',
  BCH: 'Bitcoin Cash',
  DASH: 'Dash',
  LTC: 'Litecoin',
  BNB: 'Binance Coin',
  XRP: 'Ripple',
  DOGE: 'Dogecoin',
  BUSD: 'Binance USD',
};

const SUPPORTED_COINS = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'TRX', 'BCH', 'BNB', 'DASH', 'XRP', 'DOGE', 'BUSD'];


const CoinDeposits = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [userMap, setUserMap] = useState({});
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Stats
  const [totalStats, setTotalStats] = useState({
    totalDeposits: 0,
    totalValueUSD: 0,
    totalCryptoAmount: 0,
    uniqueCoins: 0,
    uniqueUsers: 0,
  });

  const [coinStats, setCoinStats] = useState({});
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [viewMode, setViewMode] = useState('overview');

  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const { rates: cryptoRates, ratesLoading } = useCryptoRates();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    if (!ratesLoading) {
      fetchData();
    }
  }, [uid, cryptoRates, ratesLoading]);

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

  const fetchCoinDeposits = async (userMapData = {}, rates = {}) => {
    try {
      setLoading(true);
      setError(null);

      const allDeposits = [];
      const stats = {};
      let totalValueUSD = 0;
      let totalCryptoAmount = 0;
      const uniqueUserIds = new Set();
      const uniqueCoins = new Set();
      const seenTxHashes = new Set();

      const pushDeposit = (coin, cryptoAmount, usdValue, timestamp, finalUserId, docId, txHash, address, status, tx) => {
        if (!stats[coin]) {
          stats[coin] = {
            coin,
            coinName: COIN_NAMES[coin] || coin,
            totalDeposits: 0,
            totalCryptoAmount: 0,
            totalValueUSD: 0,
            uniqueUsers: new Set(),
            deposits: []
          };
        }

        stats[coin].totalDeposits += 1;
        stats[coin].totalCryptoAmount += cryptoAmount;
        stats[coin].totalValueUSD += usdValue;
        stats[coin].uniqueUsers.add(finalUserId);

        const depositData = {
          id: docId,
          coin,
          coinName: COIN_NAMES[coin] || coin,
          cryptoAmount,
          usdValue,
          timestamp,
          userId: finalUserId,
          userName: userMapData[finalUserId] || "Unknown User",
          status,
          txHash,
          address,
          fromAddress: tx.fromAddress || tx.from || '',
          toAddress: tx.toAddress || tx.to || address,
          network: tx.network || 'Unknown',
          notes: tx.notes || tx.description || '',
          rawData: tx
        };

        stats[coin].deposits.push(depositData);
        totalValueUSD += usdValue;
        totalCryptoAmount += cryptoAmount;
        uniqueUserIds.add(finalUserId);
        uniqueCoins.add(coin);
        allDeposits.push(depositData);
      };

      console.log("Fetching coin deposits...");

      // PRIMARY: Query deposits collection directly (written by the watcher/backend)
      try {
        const depositsRef = collection(db, 'deposits');
        const depositsSnapshot = await getDocs(depositsRef);

        console.log(`Found ${depositsSnapshot.size} documents in deposits collection`);

        depositsSnapshot.forEach(doc => {
          try {
            const tx = doc.data();
            const coin = (tx.coin || tx.asset || '').toUpperCase();
            if (!SUPPORTED_COINS.includes(coin)) return;

            // In the deposits collection, `amount` is the raw crypto amount
            const cryptoAmount = Number(tx.amount || 0);
            if (cryptoAmount <= 0) return;

            const usdValue = cryptoAmount * (rates[coin] || 0);

            const timestamp = tx.detectedAt?.toDate ? tx.detectedAt.toDate() :
              tx.timestamp instanceof Date ? tx.timestamp :
                (tx.timestamp ? new Date(tx.timestamp) : new Date());

            const status = tx.status === 'confirmed' ? 'Completed' :
              tx.status === 'pending' ? 'Pending' : 'Completed';

            const txHash = tx.txHash || doc.id;
            const address = tx.address || '';
            const finalUserId = tx.userId || 'unknown';

            // Deduplicate by txHash
            if (txHash && seenTxHashes.has(txHash)) return;
            if (txHash) seenTxHashes.add(txHash);

            pushDeposit(coin, cryptoAmount, usdValue, timestamp, finalUserId, doc.id, txHash, address, status, tx);
          } catch (docError) {
            console.error("Error processing deposit doc:", doc.id, docError);
          }
        });

        console.log(`Found ${allDeposits.length} deposits from deposits collection`);
      } catch (error) {
        console.log("Error querying deposits collection:", error.message);
      }

      // SUPPLEMENT: Also pull from transactionHistory for deposits recorded via depositService
      try {
        const txRef = collection(db, 'transactionHistory');
        const txSnapshot = await getDocs(txRef);

        console.log(`Found ${txSnapshot.size} total documents in transactionHistory`);

        let depositCount = 0;
        txSnapshot.forEach(doc => {
          try {
            const tx = doc.data();
            const coin = (tx.coin || tx.asset || '').toUpperCase();
            if (!SUPPORTED_COINS.includes(coin)) return;

            const direction = (tx.direction || '').toUpperCase();
            if (direction !== 'DEPOSIT') return;
            if (tx.type !== 'crypto') return;

            // Use cryptoAmount × live rates (ignore stored USD — it may use old rates)
            const cryptoAmount = Number(tx.cryptoAmount || 0);
            if (cryptoAmount <= 0) return;
            const usdValue = cryptoAmount * (rates[coin] || 0);
            if (usdValue <= 0) return;

            const txHash = tx.txHash || '';
            // Skip if already seen from deposits collection
            if (txHash && seenTxHashes.has(txHash)) return;
            if (txHash) seenTxHashes.add(txHash);

            const timestamp = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || Date.now());
            const status = tx.status || 'Completed';
            if (status !== 'Completed') return;

            const address = tx.address || '';
            const finalUserId = tx.userId || 'unknown';

            pushDeposit(coin, cryptoAmount, usdValue, timestamp, finalUserId, doc.id, txHash, address, status, tx);
            depositCount++;
          } catch (docError) {
            console.error("Error processing transactionHistory doc:", doc.id, docError);
          }
        });

        console.log(`Found ${depositCount} additional deposits from transactionHistory`);
      } catch (error) {
        console.log("Error querying transactionHistory:", error.message);
      }

      // Sort all deposits by date (newest first)
      allDeposits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Sort deposits for each coin
      Object.values(stats).forEach(coinStat => {
        coinStat.deposits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      console.log("Total coin deposits found:", allDeposits.length);
      console.log("Coins with deposits:", Object.keys(stats));

      setDeposits(allDeposits);
      setCoinStats(stats);
      setTotalStats({
        totalDeposits: allDeposits.length,
        totalValueUSD,
        totalCryptoAmount,
        uniqueCoins: uniqueCoins.size,
        uniqueUsers: uniqueUserIds.size,
      });

    } catch (error) {
      console.error("Error fetching coin deposits:", error);
      setError(`Failed to load coin deposits: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      if (ratesLoading) return;
      setLoading(true);
      const userData = await fetchUsers();
      await fetchCoinDeposits(userData, cryptoRates);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load coin deposits data");
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'NGN') =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);

  const formatUSD = (amount) => {
    const numAmount = typeof amount === 'string' ?
      Number(amount.replace(/[^\d.-]/g, '')) || 0 :
      Number(amount) || 0;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const formatCryptoAmount = (amount, coin = 'BTC') => {
    const decimals = ['USDT', 'USDC', 'BUSD'].includes(coin) ? 2 : 8;
    return Number(amount || 0).toFixed(decimals);
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

  const formatShortDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffHours < 168) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const truncateHash = (hash, length = 8) => {
    if (!hash) return 'N/A';
    if (hash.length <= length) return hash;
    return `${hash.substring(0, length)}...`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showPopup('success', 'Copied', 'Copied to clipboard!', closePopup);
      setTimeout(closePopup, 1500);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
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

  const handleTransactionClick = (transactionId) => {
    navigate(`/admin/transaction/${transactionId}`);
  };

  // Filter and sort deposits
  const filteredDeposits = deposits.filter(deposit => {
    if (activeFilter !== 'all' && deposit.coin !== activeFilter) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      deposit.coin?.toLowerCase().includes(searchLower) ||
      deposit.coinName?.toLowerCase().includes(searchLower) ||
      deposit.userName?.toLowerCase().includes(searchLower) ||
      deposit.userId?.toLowerCase().includes(searchLower) ||
      deposit.txHash?.toLowerCase().includes(searchLower) ||
      deposit.address?.toLowerCase().includes(searchLower) ||
      deposit.fromAddress?.toLowerCase().includes(searchLower) ||
      deposit.toAddress?.toLowerCase().includes(searchLower)
    );
  });

  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === 'amount') {
      return sortOrder === 'desc'
        ? b.cryptoAmount - a.cryptoAmount
        : a.cryptoAmount - b.cryptoAmount;
    } else if (sortBy === 'value') {
      return sortOrder === 'desc'
        ? b.usdValue - a.usdValue
        : a.usdValue - b.usdValue;
    } else if (sortBy === 'coin') {
      return sortOrder === 'desc'
        ? b.coin.localeCompare(a.coin)
        : a.coin.localeCompare(b.coin);
    }
    return 0;
  });

  // For coin detail view
  const coinDetailDeposits = selectedCoin && coinStats[selectedCoin]
    ? coinStats[selectedCoin].deposits
    : [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeposits = sortedDeposits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDeposits.length / itemsPerPage);

  const coinStatsArray = Object.values(coinStats).sort((a, b) => b.totalValueUSD - a.totalValueUSD);

  // Get selected coin stats
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
            className="mb-4 flex items-center gap-2 text-black/60 hover:text-black font-medium"
          >
            <BsArrowLeft className="w-5 h-5" />
            {viewMode === 'coinDetail' ? 'Back to Overview' : 'Back'}
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-black">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `${COIN_NAMES[selectedCoin] || selectedCoin} Deposits`
                  : 'Coin Deposits'
                }
              </h1>
              <p className="text-black/60 mt-1 lg:mt-2 text-sm lg:text-base">
                {viewMode === 'coinDetail' && selectedCoin
                  ? `All ${COIN_NAMES[selectedCoin] || selectedCoin} deposit transactions`
                  : 'All cryptocurrency deposits across all coins'
                }
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-black text-[rgb(255,240,120)] rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm lg:text-base"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsArrowDownCircle className="w-4 h-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                {totalStats.totalDeposits} Total Deposits
              </span>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsCurrencyDollar className="w-4 h-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                {formatUSD(totalStats.totalValueUSD)}
              </span>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsWallet className="w-4 h-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                {totalStats.uniqueCoins} Coins • {totalStats.uniqueUsers} Users
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

          {/* Debug Info */}
          {!loading && deposits.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                No coin deposits found.
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                Showing deposits for: BTC, ETH, USDT, USDC, LTC, TRX, BCH, BNB, DASH, XRP, DOGE, BUSD
              </p>
            </div>
          )}

          {/* Search and Filter */}
          {viewMode === 'overview' && (
            <div className="flex flex-col lg:flex-col gap-3 lg:gap-4 mb-6">
              <div className="flex-1 relative">
                <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search deposits by coin, user, address, or transaction hash..."
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
                  {SUPPORTED_COINS.map(coin => (
                    <button
                      key={coin}
                      onClick={() => handleCoinClick(coin)}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${selectedCoin === coin
                        ? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'
                        : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'
                        }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center">
                        {COIN_ICONS[coin] || <BsCurrencyDollar className="text-xs" />}
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
                    <option value="date">Sort by Date (Newest First)</option>
                    <option value="amount">Sort by Crypto Amount</option>
                    <option value="value">Sort by USD Value</option>
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

        {/* Selected Coin Dashboard */}
        {viewMode === 'coinDetail' && selectedCoinStats && (
          <div className="mb-8">
            {/* Coin Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                {COIN_ICONS[selectedCoin] || <BsCurrencyDollar className="text-2xl" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{COIN_NAMES[selectedCoin] || selectedCoin} Deposits</h2>
                <p className="text-black/60">
                  {selectedCoinStats.totalDeposits} deposits • {selectedCoinStats.uniqueUsers.size} users
                </p>
              </div>
            </div>

            {/* Coin-specific Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Total Deposits</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {selectedCoinStats.totalDeposits}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedCoinStats.uniqueUsers.size} unique users
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsArrowDownCircle className="w-6 h-6 text-[rgb(255,240,120)]" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Total Crypto Amount</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {formatCryptoAmount(selectedCoinStats.totalCryptoAmount, selectedCoin)} {selectedCoin}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {formatUSD(selectedCoinStats.totalValueUSD)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCurrencyDollar className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Avg Crypto Amount</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {selectedCoinStats.totalDeposits > 0
                        ? `${formatCryptoAmount(selectedCoinStats.totalCryptoAmount / selectedCoinStats.totalDeposits, selectedCoin)} ${selectedCoin}`
                        : `0 ${selectedCoin}`
                      }
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Per transaction
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsGraphUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Avg USD Value</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {selectedCoinStats.totalDeposits > 0
                        ? formatUSD(selectedCoinStats.totalValueUSD / selectedCoinStats.totalDeposits)
                        : formatUSD(0)
                      }
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Per transaction
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCashCoin className="w-6 h-6 text-[rgb(255,240,120)]" />
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
                title: "Total Deposits",
                value: totalStats.totalDeposits,
                subtext: `${totalStats.uniqueUsers} users • ${totalStats.uniqueCoins} coins`,
                bgColor: "bg-white/10",
                textColor: "text-[rgb(255,240,120)]",
                icon: <BsArrowDownCircle className="w-6 h-6 text-[rgb(255,240,120)]" />
              },
              {
                title: "Total USD Value",
                value: formatUSD(totalStats.totalValueUSD),
                subtext: "Combined USD value of all deposits",
                bgColor: "bg-white/10",
                textColor: "text-green-400",
                icon: <BsCurrencyDollar className="w-6 h-6 text-green-400" />
              },
              {
                title: "Total Crypto",
                value: formatCryptoAmount(totalStats.totalCryptoAmount, 'BTC'),
                subtext: "Total cryptocurrency deposited",
                bgColor: "bg-white/10",
                textColor: "text-purple-400",
                icon: <BsWallet className="w-6 h-6 text-purple-400" />
              },
              {
                title: "Avg Deposit Size",
                value: totalStats.totalDeposits > 0
                  ? formatUSD(totalStats.totalValueUSD / totalStats.totalDeposits)
                  : formatUSD(0),
                subtext: "Average USD value per deposit",
                bgColor: "bg-white/10",
                textColor: "text-[rgb(255,240,120)]",
                icon: <BsGraphUp className="w-6 h-6 text-[rgb(255,240,120)]" />
              }
            ].map((stat, index) => (
              <div key={index} className="bg-black rounded-xl p-4 lg:p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs lg:text-sm font-medium">{stat.title}</p>
                    <p className="text-lg lg:text-2xl font-bold text-[rgb(255,240,120)] mt-1 lg:mt-2 truncate">
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
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-lg font-semibold text-black">Deposits by Coin</h3>
              <div className="flex items-center gap-2">
                <BsArrowDownCircle className="w-4 h-4 text-[rgb(255,240,120)]" />
                <span className="text-sm text-white/40">{totalStats.totalDeposits} total deposits</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {coinStatsArray.map((coin) => (
                <div
                  key={coin.coin}
                  className="bg-black rounded-lg p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  onClick={() => handleCoinClick(coin.coin)}
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center">
                        {COIN_ICONS[coin.coin] || <BsCurrencyDollar className="text-lg lg:text-xl" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base lg:text-lg">{coin.coin}</h4>
                        <p className="text-xs text-white/40">{coin.coinName}</p>
                      </div>
                    </div>
                    <BsChevronRight className="w-4 h-4 text-white/40" />
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Total Deposits</p>
                      <p className="font-semibold text-[rgb(255,240,120)] text-sm lg:text-base">{coin.totalDeposits}</p>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 mb-1">Total Amount</p>
                      <p className="font-semibold text-green-400 text-sm lg:text-base">
                        {formatCryptoAmount(coin.totalCryptoAmount, coin.coin)} {coin.coin}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/40">Users</p>
                        <p className="font-medium text-sm text-white">{coin.uniqueUsers.size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Value</p>
                        <p className="font-medium text-sm text-[rgb(255,240,120)]">{formatUSD(coin.totalValueUSD)}</p>
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
          <div className="p-4 lg:p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[rgb(255,240,120)]">
                  {viewMode === 'coinDetail'
                    ? `${selectedCoinStats?.coinName || selectedCoin} Deposit Transactions`
                    : 'Recent Deposits'
                  }
                </h3>
                <p className="text-sm text-white/40 mt-1">
                  {viewMode === 'coinDetail'
                    ? `${selectedCoinStats?.totalDeposits || 0} transactions`
                    : `${filteredDeposits.length} deposits found`
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/10 rounded-lg">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${viewMode === 'overview'
                      ? 'bg-white/20 border border-[rgb(255,240,120)] text-[rgb(255,240,120)]'
                      : 'text-white/60 hover:bg-white/10'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode('coinDetail')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${viewMode === 'coinDetail'
                      ? 'bg-white/20 border border-[rgb(255,240,120)] text-[rgb(255,240,120)]'
                      : 'text-white/60 hover:bg-white/10'
                      }`}
                    disabled={!selectedCoin}
                  >
                    Coin View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(255,240,120)] mx-auto"></div>
              <p className="mt-4 text-white/40">Loading coin deposits...</p>
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="p-8 text-center">
              <BsCurrencyDollar className="w-16 h-16 text-white/20 mx-auto" />
              <p className="mt-4 text-white/40 text-lg">
                {searchTerm || activeFilter !== 'all'
                  ? 'No matching deposits found'
                  : 'No coin deposits found yet'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('all');
                  }}
                  className="mt-2 text-[rgb(255,240,120)] hover:opacity-80"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table for larger screens */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Coin
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Value (USD)
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(viewMode === 'coinDetail' ? coinDetailDeposits : currentDeposits).map((deposit) => (
                      <tr
                        key={deposit.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleTransactionClick(deposit.id)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              {COIN_ICONS[deposit.coin] || <BsCurrencyDollar />}
                            </div>
                            <div>
                              <p className="font-medium text-white">{deposit.coin}</p>
                              <p className="text-xs text-white/40">{deposit.coinName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-white">
                            {formatCryptoAmount(deposit.cryptoAmount, deposit.coin)} {deposit.coin}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-green-400">
                            {formatUSD(deposit.usdValue)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-white">{deposit.userName}</p>
                            <p className="text-xs text-white/40 truncate max-w-[120px]">
                              {deposit.userId}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm text-white">{formatDate(deposit.timestamp)}</p>
                            <p className="text-xs text-white/40">{formatShortDate(deposit.timestamp)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <BsCheckCircle className="w-3 h-3" />
                            {deposit.status || 'Completed'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionClick(deposit.id);
                            }}
                            className="px-3 py-1 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-md text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards view */}
              <div className="lg:hidden divide-y divide-gray-200">
                {(viewMode === 'coinDetail' ? coinDetailDeposits : currentDeposits).map((deposit) => (
                  <div
                    key={deposit.id}
                    className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleTransactionClick(deposit.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          {COIN_ICONS[deposit.coin] || <BsCurrencyDollar />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{deposit.coin}</p>
                          <p className="text-sm text-white/40">{deposit.coinName}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <BsCheckCircle className="w-3 h-3" />
                        {deposit.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-white/40">Crypto Amount</p>
                        <p className="font-medium text-white">
                          {formatCryptoAmount(deposit.cryptoAmount, deposit.coin)} {deposit.coin}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">USD Value</p>
                        <p className="font-medium text-green-400">{formatUSD(deposit.usdValue)}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="text-xs text-white/40">User</p>
                        <p className="font-medium text-white truncate max-w-[120px]">{deposit.userName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40">Date</p>
                        <p className="font-medium text-white">{formatShortDate(deposit.timestamp)}</p>
                      </div>
                    </div>

                    {deposit.txHash && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-white/40 mb-1">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-white/60 truncate">
                            {truncateHash(deposit.txHash, 20)}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(deposit.txHash);
                            }}
                            className="text-[rgb(255,240,120)] hover:opacity-80"
                          >
                            <BsClipboard className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {deposit.address && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-white/40 mb-1">Address</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-white/60 truncate">
                            {truncateHash(deposit.address, 20)}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(deposit.address);
                            }}
                            className="text-[rgb(255,240,120)] hover:opacity-80"
                          >
                            <BsClipboard className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTransactionClick(deposit.id);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-lg text-sm font-medium"
                    >
                      View Transaction Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 lg:px-6 py-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-sm text-white/60">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDeposits.length)} of {filteredDeposits.length} deposits
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
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
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === pageNum
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
                        className="px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
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
              <h4 className="font-medium text-[rgb(255,240,120)]">Coin Deposits Information</h4>
              <p className="text-sm text-white/60 mt-1">
                Shows all cryptocurrency deposits. Click on any row to view transaction details.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-white/60">Completed</span>
              </div>
              <button
                onClick={fetchData}
                className="text-sm text-[rgb(255,240,120)] hover:opacity-80 font-medium"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDeposits;