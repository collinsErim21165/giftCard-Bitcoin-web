import React, { useState, useEffect } from 'react';
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
  FaBan,
  FaPlay,
  FaCoins,
  FaUsers,
  FaCopy,
  FaTimes,
  FaUser,
  FaHistory
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

function AdminWalletsDashboard() {
  const navigate = useNavigate();
  const { popup, showPopup, closePopup } = usePopup();
  const { rates: cryptoRates } = useCryptoRates();
  const [wallets, setWallets] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [filterCoin, setFilterCoin] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [usersWithWallets, setUsersWithWallets] = useState(0);
  const [backendStatus, setBackendStatus] = useState(null);

  // Calculated stats
  const [calculatedStats, setCalculatedStats] = useState({
    totalWallets: 0,
    activeWallets: 0,
    inactiveWallets: 0,
    activeBalance: 0,
    activeBalanceUSD: 0,
    inactiveBalance: 0,
    inactiveBalanceUSD: 0,
    totalBalance: 0,
    totalBalanceUSD: 0
  });

  // Calculate balance in USD
  const calculateUSDValue = (coin, balance) => {
    if (!coin || !balance) return 0;
    const upperCoin = coin.toUpperCase();
    const rate = cryptoRates[upperCoin] || 0;
    return balance * rate;
  };

  // Calculate stats whenever wallets change
  useEffect(() => {
    const active = wallets.filter(w => w.status === 'active');
    const inactive = wallets.filter(w => w.status === 'inactive');

    let activeBalance = 0;
    let activeBalanceUSD = 0;
    let inactiveBalance = 0;
    let inactiveBalanceUSD = 0;

    active.forEach(w => {
      const bal = w.balance || 0;
      activeBalance += bal;
      activeBalanceUSD += calculateUSDValue(w.coin, bal);
    });

    inactive.forEach(w => {
      const bal = w.balance || 0;
      inactiveBalance += bal;
      inactiveBalanceUSD += calculateUSDValue(w.coin, bal);
    });

    setCalculatedStats({
      totalWallets: wallets.length,
      activeWallets: active.length,
      inactiveWallets: inactive.length,
      activeBalance,
      activeBalanceUSD,
      inactiveBalance,
      inactiveBalanceUSD,
      totalBalance: activeBalance + inactiveBalance,
      totalBalanceUSD: activeBalanceUSD + inactiveBalanceUSD
    });

    const uniqueUserIds = new Set(wallets.map(w => w.userId).filter(Boolean));
    setUsersWithWallets(uniqueUserIds.size);
  }, [wallets]);

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

  // Get user display name from userId
  const getUserDisplay = (userId) => {
    if (!userId) return 'Unknown User';
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      return user.fullName || user.email || user.username || userId.slice(0, 8) + '...';
    }
    return userId.slice(0, 8) + '...';
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/test-public', { timeout: 5000 });
      console.log('✅ Backend test successful:', response.data);
      setBackendStatus('connected');
      showPopup('success', 'Backend Connected', 'Server is running on port 5000', closePopup);
      return true;
    } catch (error) {
      console.error('❌ Backend test failed:', error);
      setBackendStatus('disconnected');
      showPopup('error', 'Backend Error', 'Cannot connect to server on port 5000', closePopup);
      return false;
    }
  };

  // Fetch all data on load
  useEffect(() => {
    const init = async () => {
      const isConnected = await testBackendConnection();
      if (isConnected) {
        fetchAllData();
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken();
  };

  const checkAdminStatus = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        console.log('👤 User:', user.email);
        console.log('👑 Admin claim:', tokenResult.claims.admin);
        return tokenResult.claims.admin === true;
      }
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      await fetchAllUsers();

      const isAdmin = await checkAdminStatus();
      if (!isAdmin) {
        console.warn('⚠️ User is not an admin!');
      }

      const token = await getAuthToken();
      console.log('🔑 Token obtained:', token ? '✅' : '❌');

      // Fetch wallets
      try {
        console.log('📡 Fetching wallets from /admin/wallets...');
        const walletsRes = await axios.get('http://localhost:5000/admin/wallets?limit=200', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Wallets response:', walletsRes.data);

        let walletsData = [];
        if (walletsRes.data.wallets) {
          walletsData = walletsRes.data.wallets;
        } else if (Array.isArray(walletsRes.data)) {
          walletsData = walletsRes.data;
        } else if (walletsRes.data.data && Array.isArray(walletsRes.data.data)) {
          walletsData = walletsRes.data.data;
        } else {
          console.log('⚠️ Unknown response structure:', walletsRes.data);
          walletsData = [];
        }

        const enhancedWallets = walletsData.map(wallet => ({
          ...wallet,
          network: wallet.network || (wallet.testnet ? 'testnet' : 'mainnet') || 'mainnet'
        }));

        setWallets(enhancedWallets);
        console.log(`📊 Set ${enhancedWallets.length} wallets`);
      } catch (error) {
        console.error('❌ Failed to fetch wallets:', error);
        setWallets([]);
      }

    } catch (error) {
      console.error('❌ Fatal error in fetchAllData:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async (walletId) => {
    try {
      const cleanWalletId = walletId.replace(/\/+$/, '');
      console.log('🔵 FORCE SYNC for wallet:', cleanWalletId);
      
      const token = await getAuthToken();
      
      const url = `http://localhost:5000/admin/wallet/${cleanWalletId}/sync`;
      console.log('🔵 Making request to:', url);
      
      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      });
      
      console.log('🔵 Response:', response.data);
      showPopup('success', 'Sync Complete', 'Wallet synced successfully', closePopup);
      fetchAllData();
      
    } catch (error) {
      console.error('🔴 Sync failed:', error);
      let errorMsg = error.message;
      if (error.response) {
        errorMsg = `Status ${error.response.status}: ${error.response.data?.error || error.response.statusText}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to backend server. Make sure it\'s running on port 5000';
      }
      showPopup('error', 'Sync Failed', errorMsg, closePopup);
    }
  };

  const activateWallet = async (walletId) => {
    try {
      const cleanWalletId = walletId.replace(/\/+$/, '');
      const token = await getAuthToken();
      const url = `http://localhost:5000/admin/wallet/${cleanWalletId}/activate`;
      
      console.log('🔵 Activating wallet at:', url);
      
      const response = await axios.post(url, {
        reason: 'Admin activated'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🔵 Activation response:', response.data);
      showPopup('success', 'Wallet Activated', 'Wallet activated successfully', closePopup);
      fetchAllData();
    } catch (error) {
      console.error('🔴 Activation failed:', error);
      let errorMsg = error.message;
      if (error.response) {
        errorMsg = `Status ${error.response.status}: ${error.response.data?.error || error.response.statusText}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to backend server. Make sure it\'s running on port 5000';
      }
      showPopup('error', 'Activation Failed', errorMsg, closePopup);
    }
  };

  const deactivateWallet = async (walletId) => {
    try {
      const cleanWalletId = walletId.replace(/\/+$/, '');
      const token = await getAuthToken();
      const url = `http://localhost:5000/admin/wallet/${cleanWalletId}/deactivate`;
      
      console.log('🔵 Deactivating wallet at:', url);
      
      const response = await axios.post(url, {
        reason: 'Admin deactivated'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🔵 Deactivation response:', response.data);
      showPopup('success', 'Wallet Deactivated', 'Wallet deactivated successfully', closePopup);
      fetchAllData();
    } catch (error) {
      console.error('🔴 Deactivation failed:', error);
      let errorMsg = error.message;
      if (error.response) {
        errorMsg = `Status ${error.response.status}: ${error.response.data?.error || error.response.statusText}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMsg = 'Cannot connect to backend server. Make sure it\'s running on port 5000';
      }
      showPopup('error', 'Deactivation Failed', errorMsg, closePopup);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const getCoinIcon = (coin) => {
    if (!coin) return <GiCash className="text-white/40 w-5 h-5" />;
    const upperCoin = coin.toUpperCase();
    return COIN_ICONS[upperCoin] || <GiCash className="text-white/40 w-5 h-5" />;
  };

  const filteredWallets = wallets.filter(wallet => {
    const userDisplay = getUserDisplay(wallet.userId).toLowerCase();
    const matchesSearch = searchTerm === '' ||
      wallet.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.coin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userDisplay.includes(searchTerm.toLowerCase());
    const matchesCoin = filterCoin === '' || wallet.coin === filterCoin;
    const matchesStatus = filterStatus === '' || wallet.status === filterStatus;
    return matchesSearch && matchesCoin && matchesStatus;
  });

  const formatAddress = (addr) => addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : 'N/A';
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'Never';
  
  // FIXED: Updated to show 8 decimal places for all crypto balances
  const formatBalance = (bal) => {
    if (!bal && bal !== 0) return '0.00000000';
    return bal.toFixed(8);
  };
  
  // FIXED: Updated to show 8 decimal places for total balances
  const formatTotalBalance = (bal) => {
    if (!bal && bal !== 0) return '0.00000000';
    return bal.toFixed(8);
  };
  
  const formatUSD = (usd) => `$${usd?.toFixed(2) || '0.00'}`;

  const uniqueCoins = [...new Set(wallets.map(w => w.coin))];

  const goToSweepPage = () => {
    navigate('/Admin-Wallet-Sweep');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(255,240,120)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black/60">Loading Wallet Administrator...</p>
        </div>
      </div>
    );
  }

  if (backendStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-[rgb(255,240,120)] flex items-center justify-center">
        <div className="text-center bg-black p-8 rounded-xl border border-white/10 max-w-md">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[rgb(255,240,120)] mb-2">Backend Not Reachable</h2>
          <p className="text-white/60 mb-4">Cannot connect to the backend server on port 5000.</p>
          <p className="text-sm text-white/40 mb-6">Make sure the server is running with: <code className="bg-white/10 px-2 py-1 rounded text-white/80">npm run server</code></p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Retry Connection
          </button>
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
          <FaCoins className="text-[rgb(255,240,120)]" />
          Wallet Administration
        </h1>
        <div className="flex gap-2">
          <button
            onClick={testBackendConnection}
            className="bg-white/10 hover:bg-white/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm"
          >
            Test Connection
          </button>
          <button
            onClick={goToSweepPage}
            className="bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <FaHistory />
            Sweep Monitor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black rounded-xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-[rgb(255,240,120)] text-xl">
            <FaWallet />
          </div>
          <div>
            <p className="text-sm text-white/40">Total Wallets</p>
            <p className="text-2xl font-bold text-[rgb(255,240,120)]">{calculatedStats.totalWallets}</p>
          </div>
        </div>

        <div className="bg-black rounded-xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-green-400 text-xl">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-sm text-white/40">Active Wallets</p>
            <p className="text-2xl font-bold text-green-400">{calculatedStats.activeWallets}</p>
            <p className="text-xs text-white/40">Balance: {formatTotalBalance(calculatedStats.activeBalance)} <span className="text-green-400 pl-4 text-base">USD:{formatUSD(calculatedStats.activeBalanceUSD)}</span></p>
          </div>
        </div>

        <div className="bg-black rounded-xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-red-400 text-xl">
            <FaTimesCircle />
          </div>
          <div>
            <p className="text-sm text-white/40">Inactive Wallets</p>
            <p className="text-2xl font-bold text-red-400">{calculatedStats.inactiveWallets}</p>
            <p className="text-xs text-white/40">Balance: {formatTotalBalance(calculatedStats.inactiveBalance)} <span className="text-red-400 pl-4 text-base">USD:{formatUSD(calculatedStats.inactiveBalanceUSD)}</span></p>
          </div>
        </div>

        <div className="bg-black rounded-xl p-5 flex items-center gap-4 border border-white/10">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-purple-400 text-xl">
            <FaUsers />
          </div>
          <div>
            <p className="text-sm text-white/40">Users with Wallets</p>
            <p className="text-2xl font-bold text-[rgb(255,240,120)]">{usersWithWallets}</p>
            <p className="text-xs text-white/40">Have at least one wallet</p>
          </div>
        </div>
      </div>

      {/* Total Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-black rounded-xl border border-[rgb(255,240,120)]/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Crypto Balance</p>
              <p className="text-3xl font-bold text-[rgb(255,240,120)]">{formatTotalBalance(calculatedStats.totalBalance)}</p>
            </div>
            <FaCoins className="text-4xl text-[rgb(255,240,120)]" />
          </div>
        </div>

        <div className="bg-black rounded-xl border border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total USD Value</p>
              <p className="text-3xl font-bold text-green-400">{formatUSD(calculatedStats.totalBalanceUSD)}</p>
            </div>
            <FaWallet className="text-4xl text-green-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-black rounded-xl shadow-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
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
        <div className="flex gap-3">
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-black rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Coin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">USD Value</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Network</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Last Deposit</th>
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
                    <td className="px-6 py-4 font-mono text-sm text-white/60" title={wallet.address}>
                      {formatAddress(wallet.address)}
                    </td>
                    <td className={`px-6 py-4 font-medium ${wallet.balance > 0 ? 'text-green-400' : 'text-white/40'}`}>
                      {formatBalance(wallet.balance)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[rgb(255,240,120)]">
                      {formatUSD(usdValue)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${wallet.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                        }`}>
                        {wallet.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                        {wallet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-white/40" />
                        <span className="text-sm font-medium text-white">
                          {getUserDisplay(wallet.userId)}
                        </span>
                      </div>
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
                      {formatDate(wallet.lastDepositAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
                        <button
                          onClick={() => forceSync(wallet.id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"
                          title="Force Sync"
                        >
                          <FaSync />
                        </button>
                        {wallet.status === 'active' ? (
                          <button
                            onClick={() => deactivateWallet(wallet.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-400 transition-colors"
                            title="Deactivate"
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateWallet(wallet.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"
                            title="Activate"
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
              <h2 className="text-xl font-bold text-[rgb(255,240,120)]">Wallet Details</h2>
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
                    {formatBalance(selectedWallet.balance)} {selectedWallet.coin}
                  </p>
                  <p className="text-sm text-[rgb(255,240,120)]">
                    {formatUSD(calculateUSDValue(selectedWallet.coin, selectedWallet.balance))}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/40">User</label>
                <div className="flex items-center gap-2 mt-1">
                  <FaUser className="text-white/40" />
                  <p className="font-medium text-white">
                    {getUserDisplay(selectedWallet.userId)}
                  </p>
                </div>
                <p className="text-xs text-white/40 mt-1 font-mono">
                  ID: {selectedWallet.userId}
                </p>
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
                    title="Copy"
                  >
                    <FaCopy className={copySuccess ? 'text-green-500' : 'text-white/30'} />
                  </button>
                </div>
                {copySuccess && <p className="text-xs text-green-500 mt-1">{copySuccess}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${selectedWallet.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                      {selectedWallet.status === 'active' ? <FaCheckCircle /> : <FaTimesCircle />}
                      {selectedWallet.status}
                    </span>
                  </p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/40">Created</label>
                  <p className="text-sm mt-1 text-white/80">{selectedWallet.createdAt ? new Date(selectedWallet.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                {selectedWallet.activatedAt && (
                  <div>
                    <label className="text-sm text-white/40">Activated</label>
                    <p className="text-sm mt-1 text-white/80">{new Date(selectedWallet.activatedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedWallet.deactivatedAt && (
                  <div>
                    <label className="text-sm text-white/40">Deactivated</label>
                    <p className="text-sm mt-1 text-white/80">{new Date(selectedWallet.deactivatedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedWallet.lastDepositAt && (
                  <div>
                    <label className="text-sm text-white/40">Last Deposit</label>
                    <p className="text-sm mt-1 text-white/80">{new Date(selectedWallet.lastDepositAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-[rgb(18,18,18)] border-t border-white/10 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  forceSync(selectedWallet.id);
                  setShowWalletModal(false);
                }}
                className="flex-1 bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                <FaSync /> Force Sync
              </button>
              {selectedWallet.status === 'active' ? (
                <button
                  onClick={() => {
                    deactivateWallet(selectedWallet.id);
                    setShowWalletModal(false);
                  }}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaBan /> Deactivate
                </button>
              ) : (
                <button
                  onClick={() => {
                    activateWallet(selectedWallet.id);
                    setShowWalletModal(false);
                  }}
                  className="flex-1 bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <FaPlay /> Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWalletsDashboard;