import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaSearch,
  FaEye,
  FaCopy,
  FaTimes,
  FaArrowRight,
  FaHistory,
  FaCoins,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { GiCash } from 'react-icons/gi';
import {
  SiBitcoin,
  SiEthereum,
  SiTether,
  SiLitecoin,
  SiBitcoincash,
  SiBinance,
  SiDash,
  SiRipple,
  SiDogecoin
} from 'react-icons/si';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import trxIcon from '../assets/trx.svg';
import BusdIcon from '../assets/Busd.png';

// Coin Icons Mapping
const COIN_ICONS = {
  BTC: <SiBitcoin className="text-orange-500 w-5 h-5" />,
  ETH: <SiEthereum className="text-blue-500 w-5 h-5" />,
  USDT: <SiTether className="text-green-500 w-5 h-5" />,
  LTC: <SiLitecoin className="text-white/40 w-5 h-5" />,
  TRX: <img src={trxIcon} className="w-6 h-6" alt="TRX" />,
  BCH: <SiBitcoincash className="text-green-600 w-5 h-5" />,
  BNB: <SiBinance className="text-yellow-500 w-5 h-5" />,
  DASH: <SiDash className="text-blue-400 w-5 h-5" />,
  BUSD: <img src={BusdIcon} className="w-6 h-6" alt="BUSD" />,
  USDC: <SiTether className="text-blue-400 w-5 h-5" />,
  XRP: <SiRipple className="text-blue-600 w-5 h-5" />,
  DOGE: <SiDogecoin className="text-yellow-400 w-5 h-5" />,
};

// Mock exchange rates
const EXCHANGE_RATES = {
  BTC: 65000,
  ETH: 3500,
  USDT: 1,
  LTC: 80,
  TRX: 0.12,
  BCH: 400,
  BNB: 600,
  DASH: 30,
  BUSD: 1,
  USDC: 1,
  XRP: 0.5,
  DOGE: 0.15,
};

function SuccessfulSweeps() {
  const navigate = useNavigate();
  const [sweeps, setSweeps] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allWallets, setAllWallets] = useState([]);
  const [walletMap, setWalletMap] = useState({});
  const [filteredSweeps, setFilteredSweeps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSweep, setSelectedSweep] = useState(null);
  const [showSweepModal, setShowSweepModal] = useState(false);
  const [filterCoin, setFilterCoin] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [copySuccess, setCopySuccess] = useState('');
  const [sweepStats, setSweepStats] = useState({
    totalSweeps: 0,
    totalAmount: 0,
    totalAmountUSD: 0,
    uniqueWallets: 0,
    largestSweep: 0,
    largestSweepUSD: 0
  });

  // Fetch all users from Firestore
  const fetchAllUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(usersList);
      return usersList;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  // Fetch all wallets from Firestore and create a map for quick lookup
  const fetchAllWallets = async () => {
    try {
      const snapshot = await getDocs(collection(db, "wallets"));
      const walletsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllWallets(walletsList);

      // Build walletId -> address map
      const map = {};
      walletsList.forEach(wallet => {
        if (wallet.id) map[wallet.id] = wallet.address;
        if (wallet.address) map[wallet.address] = wallet.address;
      });
      setWalletMap(map);

      // Return BOTH so callers can use fresh data without waiting for state
      return { walletsList, walletMap: map };
    } catch (error) {
      console.error("Error fetching wallets:", error);
      return { walletsList: [], walletMap: {} };
    }
  };

  // Get user display name from userId
  const getUserDisplay = (userId) => {
    if (!userId) return 'Unknown User';
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      return user.fullName || user.email || user.username || userId.slice(0, 8) + '...';
    }
    return userId.slice(0, 8) + '...';
  };

  const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  };

  // Fetch successful sweeps
  const fetchSuccessfulSweeps = async () => {
    try {
      setLoading(true);

      // Fetch users and wallets concurrently; use the returned values DIRECTLY
      // (React setState is async — reading state here would give stale empty values)
      const [usersList, { walletsList, walletMap: freshWalletMap }] = await Promise.all([
        fetchAllUsers(),
        fetchAllWallets(),
      ]);

      const token = await getAuthToken();

      // Fetch sweep history
      const sweepRes = await axios.get('http://localhost:5000/admin/wallet-sweeps', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      const sweepData = sweepRes.data.sweeps || [];

      console.log('📊 Raw sweep data (first record):', sweepData[0] || 'no sweeps');

      // Filter only successful sweeps and enrich with wallet data
      const successfulSweeps = sweepData
        .filter(sweep => sweep.status === 'success')
        .map((sweep) => {
          // --- SOURCE WALLET (from) ---
          // Check every field the backend might use, then fall back to Firestore
          let sourceWallet =
            sweep.walletAddress ||
            sweep.fromAddress ||
            sweep.sourceAddress ||
            sweep.address ||
            (sweep.walletId && freshWalletMap[sweep.walletId]) ||
            (sweep.wallet && sweep.wallet.address) ||
            null;

          // Last resort: match by userId + coin in Firestore wallets
          if (!sourceWallet && sweep.userId && sweep.coin) {
            const match = walletsList.find(w =>
              w.userId === sweep.userId &&
              w.coin?.toUpperCase() === sweep.coin?.toUpperCase()
            );
            if (match) sourceWallet = match.address;
          }

          // --- DESTINATION WALLET (to) ---
          // Check every field the backend might use for the sweep destination
          const destinationWallet =
            sweep.destinationAddress ||
            sweep.toAddress ||
            sweep.masterAddress ||
            sweep.sweepToAddress ||
            sweep.adminWallet ||
            null;

          return {
            ...sweep,
            sourceWallet: sourceWallet || 'Unknown Source',
            destinationWallet: destinationWallet || 'Unknown Destination',
            completedAt: sweep.completedAt || sweep.createdAt,
            amount: sweep.amount || 0,
            coin: sweep.coin || 'BTC',
            walletId: sweep.walletId
          };
        });

      console.log('✅ Enriched sweeps (first):', successfulSweeps[0] || 'none');
      setSweeps(successfulSweeps);

      // Calculate statistics
      const totalAmount = successfulSweeps.reduce((sum, s) => sum + (s.amount || 0), 0);
      const totalAmountUSD = successfulSweeps.reduce((sum, s) => sum + calculateUSDValue(s.coin, s.amount || 0), 0);
      const uniqueWallets = new Set(successfulSweeps.map(s => s.sourceWallet).filter(w => w !== 'Unknown Source')).size;
      const largestSweep = Math.max(...successfulSweeps.map(s => s.amount || 0), 0);
      const largestSweepEntry = successfulSweeps.find(s => s.amount === largestSweep);
      const largestSweepUSD = largestSweepEntry
        ? calculateUSDValue(largestSweepEntry.coin, largestSweep)
        : 0;

      setSweepStats({
        totalSweeps: successfulSweeps.length,
        totalAmount,
        totalAmountUSD,
        uniqueWallets,
        largestSweep,
        largestSweepUSD
      });

    } catch (error) {
      console.error('Error fetching successful sweeps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuccessfulSweeps();
  }, []);

  // Filter sweeps
  useEffect(() => {
    let filtered = [...sweeps];

    // Apply coin filter
    if (filterCoin) {
      filtered = filtered.filter(s => s.coin === filterCoin);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      filtered = filtered.filter(s => {
        const sweepDate = new Date(s.completedAt || s.createdAt);

        switch (dateRange) {
          case 'today':
            return sweepDate >= today;
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return sweepDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return sweepDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.sourceWallet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destinationWallet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.coin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserDisplay(s.userId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSweeps(filtered);
  }, [sweeps, searchTerm, filterCoin, dateRange]);

  const viewTransaction = (txHash) => {
    if (txHash) {
      window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const calculateUSDValue = (coin, amount) => {
    if (!coin || !amount) return 0;
    const upperCoin = coin.toUpperCase();
    const rate = EXCHANGE_RATES[upperCoin] || 0;
    return amount * rate;
  };

  const getCoinIcon = (coin) => {
    if (!coin) return <GiCash className="text-white/40 w-5 h-5" />;
    const upperCoin = coin.toUpperCase();
    return COIN_ICONS[upperCoin] || <GiCash className="text-white/40 w-5 h-5" />;
  };

  const formatAddress = (addr) => addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : 'N/A';
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';
  const formatShortDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
  const formatBalance = (bal) => bal?.toFixed(8) || '0.00000000';
  const formatUSD = (usd) => `$${usd?.toFixed(2) || '0.00'}`;

  const uniqueCoins = [...new Set(sweeps.map(s => s.coin))];

  if (loading && sweeps.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(255,240,120)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black/60">Loading Successful Sweeps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(255,240,120)] p-6">
      {/* Header */}
      <div className="bg-black rounded-xl shadow-sm p-6 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FaCheckCircle className="text-green-400 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-white">Successful Sweep Transactions</h1>
            <p className="text-white/40 text-sm">View all completed wallet sweeps and their destinations</p>
          </div>
        </div>
        <button
          onClick={fetchSuccessfulSweeps}
          className="bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <FaHistory />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Total Successful Sweeps</p>
            <FaCheckCircle className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-[rgb(255,240,120)]">{sweepStats.totalSweeps}</p>
        </div>

        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Total Amount Swept</p>
            <FaCoins className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-[rgb(255,240,120)]">{formatBalance(sweepStats.totalAmount)}</p>
          <p className="text-xs text-white/40 mt-1">{formatUSD(sweepStats.totalAmountUSD)}</p>
        </div>

        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Unique Source Wallets</p>
            <FaHistory className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-[rgb(255,240,120)]">{sweepStats.uniqueWallets}</p>
        </div>

        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Largest Sweep</p>
            <FaArrowRight className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-[rgb(255,240,120)]">{formatBalance(sweepStats.largestSweep)}</p>
          <p className="text-xs text-white/40 mt-1">{formatUSD(sweepStats.largestSweepUSD)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by source wallet, destination, tx hash, or user..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"
              value={filterCoin}
              onChange={(e) => setFilterCoin(e.target.value)}
            >
              <option value="">All Coins</option>
              {uniqueCoins.map(coin => (
                <option key={coin} value={coin}>{coin}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sweeps Table */}
      <div className="bg-black rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Coin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Source Wallet (From)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Destination Wallet (To)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">USD Value</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Transaction Hash</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSweeps.map((sweep, index) => {
                const usdValue = calculateUSDValue(sweep.coin, sweep.amount);
                return (
                  <tr key={sweep.id || index} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-white">
                        {getCoinIcon(sweep.coin)}
                        <span>{sweep.coin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white/60" title={sweep.sourceWallet}>
                          {formatAddress(sweep.sourceWallet)}
                        </span>
                        {sweep.sourceWallet && sweep.sourceWallet !== 'Unknown Source' && (
                          <button
                            onClick={() => handleCopy(sweep.sourceWallet)}
                            className="text-white/40 hover:text-white/70"
                            title="Copy source wallet"
                          >
                            <FaCopy size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white/60" title={sweep.destinationWallet}>
                          {formatAddress(sweep.destinationWallet)}
                        </span>
                        <button
                          onClick={() => handleCopy(sweep.destinationWallet)}
                          className="text-white/40 hover:text-white/70"
                          title="Copy destination wallet"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-white">{getUserDisplay(sweep.userId)}</div>
                        <div className="text-xs text-white/40">{sweep.userId?.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-400">
                      {formatBalance(sweep.amount)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[rgb(255,240,120)]">
                      {formatUSD(usdValue)}
                    </td>
                    <td className="px-6 py-4">
                      {sweep.txHash ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white/60">
                            {sweep.txHash.slice(0, 8)}...{sweep.txHash.slice(-6)}
                          </span>
                          <button
                            onClick={() => viewTransaction(sweep.txHash)}
                            className="text-green-400 hover:text-green-300"
                            title="View on explorer"
                          >
                            <FaExternalLinkAlt size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      <div>{formatShortDate(sweep.completedAt || sweep.createdAt)}</div>
                      <div className="text-xs text-white/30">
                        {new Date(sweep.completedAt || sweep.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedSweep(sweep);
                          setShowSweepModal(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSweeps.length === 0 && (
          <div className="text-center py-16">
            <FaCheckCircle className="text-5xl text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No successful sweep transactions found</p>
          </div>
        )}
      </div>

      {/* Sweep Details Modal */}
      {showSweepModal && selectedSweep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(18,18,18)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="sticky top-0 bg-[rgb(18,18,18)] border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[rgb(255,240,120)]">Sweep Transaction Details</h2>
              <button
                onClick={() => setShowSweepModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Coin and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Coin</label>
                  <div className="flex items-center gap-2 mt-1 font-semibold text-white">
                    {getCoinIcon(selectedSweep.coin)}
                    {selectedSweep.coin}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/40">Amount</label>
                  <p className="font-bold text-lg text-green-400">
                    {formatBalance(selectedSweep.amount)} {selectedSweep.coin}
                  </p>
                  <p className="text-sm text-[rgb(255,240,120)]">
                    {formatUSD(calculateUSDValue(selectedSweep.coin, selectedSweep.amount))}
                  </p>
                </div>
              </div>

              {/* Source Wallet */}
              <div>
                <label className="text-sm text-white/40">Source Wallet (From)</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80">
                    {selectedSweep.sourceWallet}
                  </code>
                  {selectedSweep.sourceWallet && selectedSweep.sourceWallet !== 'Unknown Source' && (
                    <button
                      onClick={() => handleCopy(selectedSweep.sourceWallet)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                    >
                      <FaCopy className={copySuccess ? 'text-green-500' : 'text-white/30'} />
                    </button>
                  )}
                </div>
              </div>

              {/* Destination Wallet */}
              <div>
                <label className="text-sm text-white/40">Destination Wallet (To)</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80">
                    {selectedSweep.destinationWallet}
                  </code>
                  <button
                    onClick={() => handleCopy(selectedSweep.destinationWallet)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                  >
                    <FaCopy className={copySuccess ? 'text-green-500' : 'text-white/30'} />
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">User</label>
                  <p className="font-medium mt-1 text-white">{getUserDisplay(selectedSweep.userId)}</p>
                  <p className="text-xs text-white/40 mt-1">ID: {selectedSweep.userId}</p>
                </div>
                <div>
                  <label className="text-sm text-white/40">Wallet ID</label>
                  <p className="text-sm mt-1 font-mono text-white/70">{selectedSweep.walletId || 'N/A'}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-white/40">Status</label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    <FaCheckCircle /> Success
                  </span>
                </div>
              </div>

              {/* Transaction Hash */}
              {selectedSweep.txHash && (
                <div>
                  <label className="text-sm text-white/40">Transaction Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80">
                      {selectedSweep.txHash}
                    </code>
                    <button
                      onClick={() => viewTransaction(selectedSweep.txHash)}
                      className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm flex items-center gap-2"
                    >
                      <FaExternalLinkAlt size={12} />
                      View
                    </button>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Created</label>
                  <p className="text-sm mt-1 text-white/80">{formatDate(selectedSweep.createdAt)}</p>
                </div>
                {selectedSweep.completedAt && (
                  <div>
                    <label className="text-sm text-white/40">Completed</label>
                    <p className="text-sm mt-1 text-white/80">{formatDate(selectedSweep.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-[rgb(18,18,18)] border-t border-white/10 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowSweepModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuccessfulSweeps;