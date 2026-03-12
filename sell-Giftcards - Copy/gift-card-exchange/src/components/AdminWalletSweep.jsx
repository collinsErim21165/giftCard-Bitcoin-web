import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCryptoRates } from '../hooks/useCryptoRates';
import usePopup from './usePopup';
import CustomPopup from './CustomPopup';
import {
  FaWallet,
  FaExclamationTriangle,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaEye,
  FaRedo,
  FaCoins,
  FaClock,
  FaCopy,
  FaTimes,
  FaChartLine,
  FaHistory,
  FaArrowRight,
  FaUser,
  FaPlay,
  FaBug
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
import trxIcon from '../assets/tron-trx-logo.svg';
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


function AdminWalletSweep() {
  const navigate = useNavigate();
  const { popup, showPopup, closePopup } = usePopup();
  const { rates: cryptoRates } = useCryptoRates();
  const [wallets, setWallets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [sweepHistory, setSweepHistory] = useState([]);
  const [filteredWallets, setFilteredWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [filterCoin, setFilterCoin] = useState('');
  const [sweepFilter, setSweepFilter] = useState('all');
  const [copySuccess, setCopySuccess] = useState('');
  const [usersWithWallets, setUsersWithWallets] = useState(0);

  // Sweep statistics
  const [sweepStats, setSweepStats] = useState({
    totalWallets: 0,
    walletsWithBalance: 0,
    sweptWallets: 0,
    pendingWallets: 0,
    failedWallets: 0,
    emptyWallets: 0,
    totalBalance: 0,
    totalBalanceUSD: 0,
    sweptAmount: 0,
    sweptAmountUSD: 0,
    pendingAmount: 0,
    pendingAmountUSD: 0,
    failedAmount: 0,
    failedAmountUSD: 0
  });





  // Fetch all users from Firestore
  const fetchAllUsers = async () => {
    try {
      // addDebugLog('Fetching all users from Firestore');
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // addDebugLog(`Found ${usersList.length} users`);
      setAllUsers(usersList);
      return usersList;
    } catch (error) {
      // addDebugLog('Error fetching users', { error: error.message });
      console.error("Error fetching users:", error);
      return [];
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
    if (!user) {
      // addDebugLog('No authenticated user found');
      throw new Error('Not authenticated');
    }
    // addDebugLog('Getting auth token for user', { email: user.email });
    return await user.getIdToken();
  };

  const checkAdminStatus = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        // addDebugLog('Admin status check', {
        //   email: user.email,
        //   isAdmin: tokenResult.claims.admin
        // });
        return tokenResult.claims.admin === true;
      }
      return false;
    } catch (error) {
      // addDebugLog('Error checking admin status', { error: error.message });
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Fetch all data (wallets)
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // addDebugLog('Starting fetchAllData');

      // First fetch all users from Firestore
      await fetchAllUsers();

      const token = await getAuthToken();
      // addDebugLog('Auth token obtained');

      // Fetch all wallets
      // addDebugLog('Fetching wallets from /admin/wallets');
      const walletsRes = await axios.get('http://localhost:5000/admin/wallets?limit=500', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // addDebugLog('Wallets response received', {
      //   status: walletsRes.status,
      //   hasData: !!walletsRes.data
      // });

      // Handle different response structures
      let walletsData = [];
      if (walletsRes.data.wallets) {
        walletsData = walletsRes.data.wallets;
        // addDebugLog(`Found ${walletsData.length} wallets in response.wallets`);
      } else if (Array.isArray(walletsRes.data)) {
        walletsData = walletsRes.data;
        // addDebugLog(`Found ${walletsData.length} wallets in array response`);
      } else if (walletsRes.data.data && Array.isArray(walletsRes.data.data)) {
        walletsData = walletsRes.data.data;
        // addDebugLog(`Found ${walletsData.length} wallets in response.data`);
      } else {
        // addDebugLog('Unknown response structure', walletsRes.data);
        walletsData = [];
      }

      // Try to fetch sweep history if available
      try {
        // addDebugLog('Fetching sweep history from /admin/wallet-sweeps');
        const sweepRes = await axios.get('http://localhost:5000/admin/wallet-sweeps', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sweepData = sweepRes.data.sweeps || [];
        // addDebugLog(`Found ${sweepData.length} sweep records`);
        setSweepHistory(sweepData);

        // Merge sweep status with wallets
        const walletsWithSweepStatus = walletsData.map(wallet => {
          const sweepRecord = sweepData.find(s => s.walletAddress === wallet.address);

          if (!sweepRecord && wallet.balance > 0) {
            return { ...wallet, sweepStatus: 'pending', sweepId: null, sweepTxHash: null, sweepCompletedAt: null, sweepError: null };
          } else if (sweepRecord) {
            return {
              ...wallet,
              sweepStatus: sweepRecord.status,
              sweepId: sweepRecord.id,
              sweepTxHash: sweepRecord.txHash,
              sweepCompletedAt: sweepRecord.completedAt,
              sweepError: sweepRecord.error
            };
          } else {
            return { ...wallet, sweepStatus: 'empty', sweepId: null, sweepTxHash: null, sweepCompletedAt: null, sweepError: null };
          }
        });

        setWallets(walletsWithSweepStatus);
      } catch (error) {
        // addDebugLog('Sweep history endpoint failed', {
        //   status: error.response?.status,
        //   message: error.message
        // });

        // If sweep endpoint doesn't exist, just show wallets with pending status
        const walletsWithStatus = walletsData.map(wallet => ({
          ...wallet,
          sweepStatus: wallet.balance > 0 ? 'pending' : 'empty',
          sweepId: null,
          sweepTxHash: null,
          sweepCompletedAt: null,
          sweepError: null
        }));

        setWallets(walletsWithStatus);
      }

      // Calculate unique users with wallets
      const uniqueUserIds = new Set(walletsData.map(w => w.userId).filter(Boolean));
      setUsersWithWallets(uniqueUserIds.size);
      // addDebugLog(`Found ${uniqueUserIds.size} unique users with wallets`);

    } catch (error) {
      // addDebugLog('Fatal error in fetchAllData', {
      //   message: error.message,
      //   response: error.response?.data
      // });
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics whenever wallets change
  useEffect(() => {
    const totalWallets = wallets.length;
    const walletsWithBalance = wallets.filter(w => w.balance > 0).length;
    const sweptWallets = wallets.filter(w => w.sweepStatus === 'success').length;
    const pendingWallets = wallets.filter(w => w.sweepStatus === 'pending' && w.balance > 0).length;
    const failedWallets = wallets.filter(w => w.sweepStatus === 'failed').length;
    const emptyWallets = wallets.filter(w => w.balance === 0 || w.sweepStatus === 'empty').length;

    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalBalanceUSD = wallets.reduce((sum, w) => sum + calculateUSDValue(w.coin, w.balance || 0), 0);

    const sweptAmount = wallets
      .filter(w => w.sweepStatus === 'success')
      .reduce((sum, w) => sum + (w.balance || 0), 0);
    const sweptAmountUSD = wallets
      .filter(w => w.sweepStatus === 'success')
      .reduce((sum, w) => sum + calculateUSDValue(w.coin, w.balance || 0), 0);

    const pendingAmount = wallets
      .filter(w => w.sweepStatus === 'pending' && w.balance > 0)
      .reduce((sum, w) => sum + (w.balance || 0), 0);
    const pendingAmountUSD = wallets
      .filter(w => w.sweepStatus === 'pending' && w.balance > 0)
      .reduce((sum, w) => sum + calculateUSDValue(w.coin, w.balance || 0), 0);

    const failedAmount = wallets
      .filter(w => w.sweepStatus === 'failed')
      .reduce((sum, w) => sum + (w.balance || 0), 0);
    const failedAmountUSD = wallets
      .filter(w => w.sweepStatus === 'failed')
      .reduce((sum, w) => sum + calculateUSDValue(w.coin, w.balance || 0), 0);

    setSweepStats({
      totalWallets,
      walletsWithBalance,
      sweptWallets,
      pendingWallets,
      failedWallets,
      emptyWallets,
      totalBalance,
      totalBalanceUSD,
      sweptAmount,
      sweptAmountUSD,
      pendingAmount,
      pendingAmountUSD,
      failedAmount,
      failedAmountUSD
    });
  }, [wallets]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter wallets based on search, coin, and sweep status
  useEffect(() => {
    let filtered = [...wallets];

    if (sweepFilter !== 'all') {
      if (sweepFilter === 'withBalance') {
        filtered = filtered.filter(w => w.balance > 0);
      } else if (sweepFilter === 'empty') {
        filtered = filtered.filter(w => w.balance === 0);
      } else {
        filtered = filtered.filter(w => w.sweepStatus === sweepFilter);
      }
    }

    if (filterCoin) {
      filtered = filtered.filter(w => w.coin === filterCoin);
    }

    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.coin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserDisplay(w.userId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWallets(filtered);
  }, [wallets, searchTerm, filterCoin, sweepFilter]);

  // Enhanced sweep function with detailed error handling
  const triggerSweep = async (walletId) => {
    // setLastError(null);
    // addDebugLog('Triggering sweep for wallet', { walletId });

    try {
      const token = await getAuthToken();
      // addDebugLog('Auth token obtained for sweep');

      const cleanWalletId = walletId.replace(/\/+$/, '');
      const url = `http://localhost:5000/admin/wallet/${cleanWalletId}/sweep`;

      // addDebugLog('Making sweep request', { url });

      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 180000 // 3 minute timeout — sweep includes KMS decrypt + Blockstream API retries
      });

      // addDebugLog('Sweep response received', response.data);
      showPopup('success', 'Sweep Initiated',
        `✅ Sweep initiated successfully!\n\nTransaction Hash: ${response.data.txHash || 'N/A'}\nAmount: ${response.data.amount || 'N/A'}\nFee: ${response.data.fee || 'N/A'}`,
        closePopup
      );

      fetchAllData();

    } catch (error) {
      // setLastError(error);

      // Detailed error logging
      const errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      };

      // addDebugLog('Sweep failed with error', errorDetails);
      console.error('Sweep error details:', errorDetails);

      // Build comprehensive error message
      let errorMessage = '❌ Sweep failed!\n\n';

      if (error.response) {
        // The server responded with an error status
        errorMessage += `Server Error (${error.response.status}):\n`;
        errorMessage += error.response.data?.error || error.response.statusText;

        // Add detailed error info if available
        if (error.response.data?.details) {
          errorMessage += `\n\nDetails: ${error.response.data.details}`;
        }
        if (error.response.data?.hint) {
          errorMessage += `\n\nHint: ${error.response.data.hint}`;
        }
      } else if (error.request) {
        // No response received
        errorMessage += 'No response from server.\n';
        errorMessage += 'Please check if the backend server is running.';

        // Check if it might be a CORS issue
        if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          errorMessage += '\n\nPossible CORS issue. Check server configuration.';
        }
      } else {
        // Request setup error
        errorMessage += `Request error: ${error.message}`;
      }

      // Add connection check suggestion
      errorMessage += '\n\n--- Debug Info ---';
      errorMessage += `\nEndpoint: ${error.config?.url || 'unknown'}`;
      errorMessage += `\nStatus: ${error.response?.status || 'no response'}`;
      errorMessage += `\nCode: ${error.code || 'unknown'}`;

      showPopup('error', 'Sweep Failed', errorMessage, closePopup);
    }
  };

  const retrySweep = async (walletId) => {
    // addDebugLog('Retrying sweep for wallet', { walletId });
    await triggerSweep(walletId);
  };

  const viewTransaction = (txHash, explorer) => {
    if (txHash) {
      const url = explorer ? `${explorer}/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`;
      // addDebugLog('Viewing transaction', { url });
      window.open(url, '_blank');
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
    const rate = cryptoRates[upperCoin] || 0;
    return amount * rate;
  };

  const getCoinIcon = (coin) => {
    if (!coin) return <GiCash className="text-white/40 w-5 h-5" />;
    const upperCoin = coin.toUpperCase();
    return COIN_ICONS[upperCoin] || <GiCash className="text-white/40 w-5 h-5" />;
  };

  const getSweepStatusBadge = (wallet) => {
    const { sweepStatus, balance } = wallet;

    if (balance === 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
        <FaWallet /> Empty
      </span>;
    }

    switch (sweepStatus) {
      case 'success':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          <FaCheckCircle /> Swept
        </span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          <FaTimesCircle /> Failed
        </span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
          <FaClock /> Pending
        </span>;
    }
  };

  const formatAddress = (addr) => addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : 'N/A';
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';
  const formatBalance = (bal) => bal?.toFixed(8) || '0.00000000';
  const formatUSD = (usd) => `$${usd?.toFixed(2) || '0.00'}`;

  const uniqueCoins = [...new Set(wallets.map(w => w.coin))];

  if (loading && wallets.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(255,240,120)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black/60">Loading Wallet Sweep Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(255,240,120)] p-6">
      <CustomPopup popup={popup} onClose={closePopup} />

      {/* Header */}
      <div className="bg-black rounded-xl shadow-sm p-6 mb-6 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaHistory className="text-[rgb(255,240,120)]" />
          Wallet Sweep Monitor
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/Successful-Sweeps')}
            className="bg-white/10 hover:bg-white/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaCheckCircle />
            Successful Sweeps
          </button>
          <button
            onClick={fetchAllData}
            className="bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <FaSync />
            Refresh
          </button>
        </div>
      </div>



      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Total Wallets</p>
            <FaWallet className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-[rgb(255,240,120)]">{sweepStats.totalWallets}</p>
          <p className="text-xs text-white/40 mt-1">
            With Balance: {sweepStats.walletsWithBalance} | Empty: {sweepStats.emptyWallets}
          </p>
        </div>

        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Pending Sweep</p>
            <FaClock className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{sweepStats.pendingWallets}</p>
          <p className="text-xs text-white/40 mt-1">
            Amount: {formatBalance(sweepStats.pendingAmount)} (USD: {formatUSD(sweepStats.pendingAmountUSD)})
          </p>
        </div>

        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Successfully Swept</p>
            <FaCheckCircle className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-400">{sweepStats.sweptWallets}</p>
          <p className="text-xs text-white/40 mt-1">
            Amount: {formatBalance(sweepStats.sweptAmount)} (USD: {formatUSD(sweepStats.sweptAmountUSD)})
          </p>
        </div>

        <div className="bg-black rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/40">Failed Sweeps</p>
            <FaExclamationTriangle className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-400">{sweepStats.failedWallets}</p>
          <p className="text-xs text-white/40 mt-1">
            Amount: {formatBalance(sweepStats.failedAmount)} (USD: {formatUSD(sweepStats.failedAmountUSD)})
          </p>
        </div>
      </div>

      {/* Total Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-black rounded-xl border border-[rgb(255,240,120)]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Crypto Balance</p>
              <p className="text-3xl font-bold text-[rgb(255,240,120)]">{formatBalance(sweepStats.totalBalance)}</p>
            </div>
            <FaCoins className="text-4xl text-[rgb(255,240,120)]" />
          </div>
        </div>

        <div className="bg-black rounded-xl border border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total USD Value</p>
              <p className="text-3xl font-bold text-green-400">{formatUSD(sweepStats.totalBalanceUSD)}</p>
            </div>
            <FaWallet className="text-4xl text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by address, user name, user ID, or coin..."
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
              value={sweepFilter}
              onChange={(e) => setSweepFilter(e.target.value)}
            >
              <option value="all">All Wallets</option>
              <option value="withBalance">With Balance</option>
              <option value="pending">Pending Sweep</option>
              <option value="success">Swept</option>
              <option value="failed">Failed</option>
              <option value="empty">Empty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-black rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Coin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">USD Value</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Sweep Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Tx Hash</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Network</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Last Sweep</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWallets.map(wallet => {
                const usdValue = calculateUSDValue(wallet.coin, wallet.balance);

                return (
                  <tr key={wallet.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-white">
                        {getCoinIcon(wallet.coin)}
                        <span>{wallet.coin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white/60" title={wallet.address}>
                          {formatAddress(wallet.address)}
                        </span>
                        <button
                          onClick={() => handleCopy(wallet.address)}
                          className="text-white/40 hover:text-white/70"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-white/40" />
                        <span className="text-sm font-medium text-white">
                          {getUserDisplay(wallet.userId)}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-medium ${wallet.balance > 0 ? 'text-green-400' : 'text-white/40'}`}>
                      {formatBalance(wallet.balance)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[rgb(255,240,120)]">
                      {wallet.balance > 0 ? formatUSD(usdValue) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getSweepStatusBadge(wallet)}
                    </td>
                    <td className="px-6 py-4">
                      {wallet.sweepTxHash ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white/60">
                            {wallet.sweepTxHash.slice(0, 8)}...
                          </span>
                          <button
                            onClick={() => viewTransaction(wallet.sweepTxHash)}
                            className="text-[rgb(255,240,120)] hover:opacity-80 text-xs"
                          >
                            View
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${wallet.network === 'mainnet'
                        ? 'bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)]'
                        : 'bg-orange-500/20 text-orange-400'
                        }`}>
                        {wallet.network}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {wallet.sweepCompletedAt ? formatDate(wallet.sweepCompletedAt) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => {
                            setSelectedWallet(wallet);
                            setShowWalletModal(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-[rgb(255,240,120)] transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {wallet.balance > 0 && wallet.sweepStatus !== 'success' && (
                          <button
                            onClick={() => wallet.sweepStatus === 'failed'
                              ? retrySweep(wallet.id)
                              : triggerSweep(wallet.id)
                            }
                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"
                            title={wallet.sweepStatus === 'failed' ? 'Retry Sweep' : 'Trigger Sweep'}
                          >
                            <FaPlay />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredWallets.length === 0 && (
          <div className="text-center py-16">
            <FaWallet className="text-5xl text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No wallets found</p>
          </div>
        )}
      </div>

      {/* Wallet Details Modal */}
      {showWalletModal && selectedWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(18,18,18)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="sticky top-0 bg-[rgb(18,18,18)] border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[rgb(255,240,120)]">Wallet Sweep Details</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Coin</label>
                  <p className="font-semibold flex items-center gap-2 mt-1 text-white">
                    {getCoinIcon(selectedWallet.coin)}
                    {selectedWallet.coin}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-white/40">Balance</label>
                  <p className={`font-bold text-lg ${selectedWallet.balance > 0 ? 'text-green-400' : 'text-white/40'}`}>
                    {selectedWallet.balance} {selectedWallet.coin}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/40">User</label>
                <div className="flex items-center gap-2 mt-1">
                  <FaUser className="text-white/40" />
                  <p className="font-medium text-white">{getUserDisplay(selectedWallet.userId)}</p>
                </div>
                <p className="text-xs text-white/40 mt-1">ID: {selectedWallet.userId}</p>
              </div>

              <div>
                <label className="text-sm text-white/40">Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80">
                    {selectedWallet.address}
                  </code>
                  <button
                    onClick={() => handleCopy(selectedWallet.address)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                  >
                    <FaCopy className={copySuccess ? 'text-green-500' : 'text-white/30'} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Sweep Status</label>
                  <p className="mt-1">{getSweepStatusBadge(selectedWallet)}</p>
                </div>
                <div>
                  <label className="text-sm text-white/40">Network</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedWallet.network === 'mainnet'
                      ? 'bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)]'
                      : 'bg-orange-500/20 text-orange-400'
                      }`}>
                      {selectedWallet.network}
                    </span>
                  </p>
                </div>
              </div>

              {selectedWallet.sweepTxHash && (
                <div>
                  <label className="text-sm text-white/40">Transaction Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80">
                      {selectedWallet.sweepTxHash}
                    </code>
                    <button
                      onClick={() => viewTransaction(selectedWallet.sweepTxHash)}
                      className="px-3 py-2 bg-[rgb(255,240,120)] text-black rounded-lg hover:opacity-90 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              )}

              {selectedWallet.sweepError && (
                <div>
                  <label className="text-sm text-white/40">Error</label>
                  <p className="mt-1 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedWallet.sweepError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Created</label>
                  <p className="text-sm mt-1 text-white/80">{formatDate(selectedWallet.createdAt)}</p>
                </div>
                {selectedWallet.sweepCompletedAt && (
                  <div>
                    <label className="text-sm text-white/40">Last Sweep</label>
                    <p className="text-sm mt-1 text-white/80">{formatDate(selectedWallet.sweepCompletedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-[rgb(18,18,18)] border-t border-white/10 px-6 py-4 flex flex-wrap gap-3">
              <button
                onClick={() => setShowWalletModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedWallet.balance > 0 && selectedWallet.sweepStatus !== 'success' && (
                <button
                  onClick={() => {
                    if (selectedWallet.sweepStatus === 'failed') {
                      retrySweep(selectedWallet.id);
                    } else {
                      triggerSweep(selectedWallet.id);
                    }
                    setShowWalletModal(false);
                  }}
                  className="flex-1 bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <FaArrowRight /> {selectedWallet.sweepStatus === 'failed' ? 'Retry Sweep' : 'Trigger Sweep'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWalletSweep;