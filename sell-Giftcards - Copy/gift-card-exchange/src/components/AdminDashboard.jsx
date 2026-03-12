import React, { useState, useEffect } from "react";
import { Sidebarpage } from "./Sidebarpage";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCheckCircle,
  FaBitcoin,
  FaChartBar,
  FaWallet,
  FaArrowRight,
  FaShieldAlt
} from "react-icons/fa";
import { BsGiftFill, BsWallet2 } from "react-icons/bs";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

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

const COIN_ICONS = {
  BTC: <SiBitcoin className="text-orange-500 text-xl" />,
  ETH: <SiEthereum className="text-indigo-500 text-xl" />,
  USDT: <SiTether className="text-green-500 text-xl" />,
  USDC: <SiTether className="text-blue-500 text-xl" />,
  TRX: <img src={trxIcon} alt="TRX" className="w-5 h-5" />,
  BCH: <SiBitcoincash className="text-cyan-500 text-xl" />,
  DASH: <SiDash className="text-gray-700 text-xl" />,
  LTC: <SiLitecoin className="text-blue-500 text-xl" />,
  BNB: <SiBinance className="text-yellow-500 text-xl" />,
  XRP: <SiRipple className="text-black text-xl" />,
  DOGE: <SiDogecoin className="text-yellow-600 text-xl" />,
  BUSD: <SiBinance className="text-yellow-400 text-xl" />,
};

/* ================= STATUS STYLES ================= */
const statusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-600 text-white";
    case "Pending":
      return "bg-yellow-500 text-black";
    case "Failed":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const AdminDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();

  /* ================= USERS ================= */
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersToday, setNewUsersToday] = useState(0);
  const [userMap, setUserMap] = useState({});

  /* ================= TRANSACTIONS ================= */
  const [recentTransactions, setRecentTransactions] = useState([]);

  const [giftStats, setGiftStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
  });

  const [cryptoStats, setCryptoStats] = useState({
    // Deposits
    totalDeposits: 0,
    completedDeposits: 0,
    pendingDeposits: 0,
    failedDeposits: 0,

    // Sells
    totalSells: 0,
    successfulSells: 0,
    pendingSells: 0,
    failedSells: 0,

    // Combined totals (deposits + sells)
    totalCryptoTransactions: 0,
    totalCompletedCrypto: 0,
    totalPendingCrypto: 0,
    totalFailedCrypto: 0,
  });

  const [totalPlatformRevenue, setTotalPlatformRevenue] = useState(0);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      setTotalUsers(usersSnap.size);

      const map = {};
      usersSnap.forEach((doc) => {
        map[doc.id] = doc.data().fullName;
      });
      setUserMap(map);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, "users"),
        where("createdAt", ">=", Timestamp.fromDate(today))
      );

      const todaySnap = await getDocs(q);
      setNewUsersToday(todaySnap.size);
    };

    fetchUsers();
  }, []);

  /* ================= FETCH TRANSACTIONS ================= */
  useEffect(() => {
    const fetchTransactions = async () => {
      const snap = await getDocs(collection(db, "transactionHistory"));

      let gift = { total: 0, successful: 0, pending: 0, failed: 0 };
      let crypto = {
        totalDeposits: 0,
        completedDeposits: 0,
        pendingDeposits: 0,
        failedDeposits: 0,
        totalSells: 0,
        successfulSells: 0,
        pendingSells: 0,
        failedSells: 0,
      };
      let platformRevenue = 0;

      const CRYPTO_COINS = [
        'BTC', 'ETH', 'USDT', 'USDC', 'LTC',
        'TRX', 'BCH', 'BNB', 'DASH', 'XRP',
        'DOGE', 'BUSD'
      ];

      const allTransactions = [];

      snap.docs.forEach((doc) => {
        const tx = doc.data();
        const coin = (tx.coin || tx.asset || '').toUpperCase();

        const timestamp = tx.time || tx.createdAt;
        const dateObj = timestamp?.toDate();

        // Check if it's a crypto transaction
        if (CRYPTO_COINS.includes(coin)) {
          const direction = tx.direction?.toUpperCase() ||
            (tx.transactionType?.toUpperCase() || '').includes('DEPOSIT') ? 'DEPOSIT' :
            (tx.nairaValue > 0 ? 'SELL' : 'DEPOSIT');

          if (direction === 'DEPOSIT') {
            // COUNT DEPOSITS
            crypto.totalDeposits++;

            // Track deposit statuses
            if (tx.status === "Completed") crypto.completedDeposits++;
            if (tx.status === "Pending") crypto.pendingDeposits++;
            if (tx.status === "Failed") crypto.failedDeposits++;

            // DO NOT add deposits to recent transactions

          } else if (direction === 'SELL') {
            // COUNT SELL TRANSACTIONS
            crypto.totalSells++;

            // Track sell statuses
            if (tx.status === "Completed") crypto.successfulSells++;
            if (tx.status === "Pending") crypto.pendingSells++;
            if (tx.status === "Failed") crypto.failedSells++;

            // Add platform revenue from crypto sells
            if (tx.platformRevenue) {
              platformRevenue += Number(tx.platformRevenue);
            }

            // Add to recent transactions - use dollar value
            const amount = parseFloat(tx.amount || tx.usdValue || 0);

            allTransactions.push({
              id: doc.id,
              ...tx,
              timestamp: dateObj || new Date(0),
              date: dateObj ? dateObj.toLocaleDateString() : 'N/A',
              type: coin,
              displayType: `${coin} SELL`,
              amount: amount,
              isCrypto: true,
              direction: 'SELL',
              coinIcon: COIN_ICONS[coin] || <FaBitcoin className="text-orange-400" />,
            });
          }
        } else {
          // GIFT CARD TRANSACTIONS - Match exactly your AdminTransactionDetails
          // In your AdminTransactionDetails, you check: else if (data.giftCard)
          const isGiftCard = tx.giftCard;

          if (isGiftCard) {
            gift.total++;

            // Track gift card statuses
            if (tx.status === "Completed") gift.successful++;
            if (tx.status === "Pending") gift.pending++;
            if (tx.status === "Failed") gift.failed++;

            // Add platform revenue from gift cards
            if (tx.platformRevenue) {
              platformRevenue += Number(tx.platformRevenue);
            }

            // ============ UPDATED CURRENCY PARSING ============
            let originalAmount = 0;
            let originalCurrency = 'USD';
            let displayAmount = '0.00';

            if (tx.value !== undefined && tx.value !== null) {
              const valueStr = tx.value.toString();

              // Try to extract currency and amount - MATCHING THE COMPLETED PAGE LOGIC
              const match = valueStr.match(/^([A-Za-z€£¥$]*\$?)(\d+(\.\d+)?)/);

              if (match) {
                originalAmount = Number(match[2]);
                let currencySymbol = match[1].trim();

                if (currencySymbol === '$' || currencySymbol === 'USD' || currencySymbol === '') {
                  originalCurrency = 'USD';
                } else if (currencySymbol === 'CHF') {
                  originalCurrency = 'CHF';
                } else if (currencySymbol === 'A$') {
                  originalCurrency = 'AUD';
                } else if (currencySymbol === '€') {
                  originalCurrency = 'EUR';
                } else if (currencySymbol === '£') {
                  originalCurrency = 'GBP';
                } else if (currencySymbol === '¥') {
                  originalCurrency = 'JPY';
                } else {
                  originalCurrency = currencySymbol || tx.currency || 'USD';
                }

                // Format display amount with currency symbol
                const currencySymbols = {
                  'CHF': 'CHF',
                  'AUD': 'A$',
                  'EUR': '€',
                  'GBP': '£',
                  'JPY': '¥',
                  'USD': '$'
                };

                const symbol = currencySymbols[originalCurrency] || originalCurrency;
                displayAmount = `${symbol}${originalAmount.toFixed(2)}`;
              } else {
                originalAmount = Number(valueStr.replace(/[^\d.-]/g, '')) || 0;
                originalCurrency = tx.currency || 'USD';
                displayAmount = `$${originalAmount.toFixed(2)}`;
              }
            } else if (tx.amount !== undefined && tx.amount !== null) {
              const amountStr = tx.amount.toString();
              const match = amountStr.match(/^([A-Za-z€£¥$]*\$?)(\d+(\.\d+)?)/);

              if (match) {
                originalAmount = Number(match[2]);
                let currencySymbol = match[1].trim();

                // Same currency detection logic
                if (currencySymbol === '$' || currencySymbol === 'USD' || currencySymbol === '') {
                  originalCurrency = 'USD';
                  displayAmount = `$${originalAmount.toFixed(2)}`;
                } else if (currencySymbol === 'CHF') {
                  originalCurrency = 'CHF';
                  displayAmount = `CHF${originalAmount.toFixed(2)}`;
                } else if (currencySymbol === 'A$') {
                  originalCurrency = 'AUD';
                  displayAmount = `A$${originalAmount.toFixed(2)}`;
                } else {
                  displayAmount = `${currencySymbol}${originalAmount.toFixed(2)}`;
                }
              } else {
                originalAmount = Number(amountStr.replace(/[^\d.-]/g, '')) || 0;
                displayAmount = `$${originalAmount.toFixed(2)}`;
              }
            }
            // ============ END UPDATED CURRENCY PARSING ============

            // Use the giftCard field for display type
            const displayType = tx.giftCard || 'Gift Card';

            allTransactions.push({
              id: doc.id,
              ...tx,
              timestamp: dateObj || new Date(0),
              date: dateObj ? dateObj.toLocaleDateString() : 'N/A',
              type: 'Gift Card',
              displayType: displayType,
              amount: originalAmount, // Store numeric amount
              displayAmount: displayAmount, // Store formatted display amount
              originalCurrency: originalCurrency,
              isCrypto: false,
            });
          }
        }
      });

      // Sort transactions by timestamp (most recent first) and take top 10
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setRecentTransactions(allTransactions.slice(0, 10));

      // Calculate combined crypto totals
      const combinedStats = {
        ...crypto,
        totalCryptoTransactions: crypto.totalDeposits + crypto.totalSells,
        totalCompletedCrypto: crypto.completedDeposits + crypto.successfulSells,
        totalPendingCrypto: crypto.pendingDeposits + crypto.pendingSells,
        totalFailedCrypto: crypto.failedDeposits + crypto.failedSells,
      };

      setGiftStats(gift);
      setCryptoStats(combinedStats);
      setTotalPlatformRevenue(platformRevenue);
    };

    fetchTransactions();
  }, []);

  /* ================= NAVIGATION HANDLERS ================= */
  const handleSuccessfulTransactions = () => {
    navigate('/successful-transactions');
  };

  const handleSuccessfulGiftcard = () => {
    navigate('/GiftCard-Successfull');
  };

  const handlePendingGiftcard = () => {
    navigate('/GiftCard-Pending');
  };

  const handleFailedGiftcard = () => {
    navigate('/GiftCard-Failed');
  };

  const handlePendingCrypto = () => {
    navigate('/Pending-Coins-sold');
  };

  const handleFailedCrypto = () => {
    navigate('/Failed-Coins-sold');
  };

  const handleCryptoSold = () => {
    navigate('/admin-crypto-history', { state: { filter: 'sell' } });
  };

  const handleCryptoDeposits = () => {
    navigate('/Coin-Deposits', { state: { filter: 'deposit' } });
  };

  const handleGiftCardFilter = (status) => {
    navigate('/Gift-Card-Transactions', { state: { filter: status.toLowerCase(), type: 'giftcard' } });
  };

  const handleCryptoFilter = (status) => {
    navigate('/admin-crypto-history', { state: { filter: status.toLowerCase() } });
  };

  // Updated format amount function
  const formatAmount = (transaction) => {
    if (transaction.isCrypto) {
      // For crypto, show as USD
      const numAmount = Number(transaction.amount);
      if (isNaN(numAmount) || !isFinite(numAmount)) {
        return '$0.00';
      }
      return `$${numAmount.toFixed(2)}`;
    } else {
      // For gift cards, use the pre-formatted displayAmount
      if (transaction.displayAmount) {
        return transaction.displayAmount;
      }

      // Fallback for old format
      const numAmount = Number(transaction.amount);
      if (isNaN(numAmount) || !isFinite(numAmount)) {
        return '$0.00';
      }

      // Check for currency in originalCurrency field
      if (transaction.originalCurrency) {
        const currencySymbols = {
          'CHF': 'CHF',
          'AUD': 'A$',
          'EUR': '€',
          'GBP': '£',
          'JPY': '¥',
          'USD': '$'
        };
        const symbol = currencySymbols[transaction.originalCurrency] || '$';
        return `${symbol}${numAmount.toFixed(2)}`;
      }

      return `$${numAmount.toFixed(2)}`;
    }
  };

  return (
    <div className="bg-[rgb(255,240,120)] w-full min-h-screen flex flex-col md:flex-row">
      <div className={`${isCollapsed ? 'md:mr-24' : 'md:mr-52'}`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex-1 px-4 sm:px-6 py-4 md:pt-10 pt-24 sm:py-6 text-white overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black text-center sm:text-left mb-4 sm:mb-0">
            Admin Board
          </h1>

          <button
            onClick={() => navigate('/Admin-Wallets-Dashboard')}
            className="group bg-black text-[rgb(255,240,120)] px-6 py-3 rounded-xl font-semibold flex items-center gap-3 shadow-lg hover:opacity-90 transition-all duration-200"
          >
            <FaWallet className="text-xl" />
            <span>Wallet Control Center</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* ================= TOP STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            onClick={() => navigate("/admin-users")}
            className="cursor-pointer bg-black rounded-xl p-4 sm:p-6 hover:opacity-90 transition-opacity transform hover:scale-105 duration-200"
          >
            <div className="flex flex-row gap-2 justify-start items-center mb-2">
              <FaUsers className="text-[rgb(255,240,120)] text-2xl sm:text-3xl" />
              <p className="text-white/60 text-sm sm:text-base">Total Users</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[rgb(255,240,120)]">{totalUsers}</h2>
            <p className="text-xs sm:text-sm text-white/40">New Today: {newUsersToday}</p>
          </div>

          <div
            onClick={handleSuccessfulTransactions}
            className="cursor-pointer bg-black rounded-xl p-4 sm:p-6 hover:opacity-90 transition-opacity transform hover:scale-105 duration-200"
          >
            <div className="flex flex-row gap-2 justify-start items-center mb-2">
              <FaCheckCircle className="text-[rgb(255,240,120)] text-2xl sm:text-3xl" />
              <p className="text-white/60 text-sm sm:text-base">Successful</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[rgb(255,240,120)]">
              {giftStats.successful + cryptoStats.successfulSells}
            </h2>
          </div>

          <div
            onClick={handleCryptoSold}
            className="cursor-pointer bg-black rounded-xl p-4 sm:p-6 hover:opacity-90 transition-opacity transform hover:scale-105 duration-200"
          >
            <div className="flex flex-row gap-2 justify-start items-center mb-2">
              <FaBitcoin className="text-[rgb(255,240,120)] text-2xl sm:text-3xl" />
              <p className="text-white/60 text-sm sm:text-base">Crypto Sold</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[rgb(255,240,120)]">
              {cryptoStats.successfulSells}
            </h2>
          </div>

          <div className="cursor-pointer bg-black rounded-xl p-4 sm:p-6 hover:opacity-90 transition-opacity transform hover:scale-105 duration-200">
            <div className="flex flex-row gap-2 justify-start items-center mb-2">
              <FaChartBar className="text-[rgb(255,240,120)] text-2xl sm:text-3xl" />
              <p className="text-white/60 text-sm sm:text-base">Revenue</p>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[rgb(255,240,120)]">
              ₦{totalPlatformRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* ================= MIDDLE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* GIFT CARD */}
          <div className="bg-black rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <BsGiftFill className="text-[rgb(255,240,120)] text-xl sm:text-2xl" />
              <h3 className="font-semibold text-[rgb(255,240,120)] text-sm sm:text-base">Gift Card Overview</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 pt-4 gap-3 sm:gap-4">
              <div
                onClick={() => handleGiftCardFilter('all')}
                className="bg-white/10 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-white/15 transition-colors"
              >
                <p className="text-xs sm:text-sm text-white/60">Total</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{giftStats.total}</h2>
              </div>

              <div
                onClick={() => handleSuccessfulGiftcard()}
                className="bg-green-600 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
              >
                <p className="text-xs sm:text-sm text-white/80">Completed</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {giftStats.successful}
                </h2>
              </div>

              <div
                onClick={() => handlePendingGiftcard()}
                className="bg-[rgb(255,240,120)] p-3 sm:p-4 rounded-lg text-black cursor-pointer hover:opacity-90 transition-opacity"
              >
                <p className="text-xs sm:text-sm text-black/70">Pending</p>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {giftStats.pending}
                </h2>
              </div>

              <div
                onClick={() => handleFailedGiftcard()}
                className="bg-red-600 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
              >
                <p className="text-xs sm:text-sm text-white/80">Failed</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {giftStats.failed}
                </h2>
              </div>
            </div>
          </div>

          {/* CRYPTO OVERVIEW */}
          <div className="bg-black rounded-xl p-4 sm:p-6">
            <div className="flex flex-row justify-between items-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                <FaBitcoin className="text-[rgb(255,240,120)] text-xl sm:text-2xl" />
                <h3 className="font-semibold text-[rgb(255,240,120)] text-sm sm:text-base">
                  Crypto Overview
                </h3>
              </div>
              <button
                onClick={() => handleCryptoDeposits()}
                className="flex flex-row items-center justify-center bg-[rgb(255,240,120)] text-black gap-2 px-4 rounded-lg py-2 font-semibold cursor-pointer hover:opacity-90 transition-opacity shadow-md text-sm"
              >
                <span>Deposits:</span>
                <span className="text-lg font-bold">
                  {cryptoStats.totalDeposits}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => handleCryptoFilter('all')}
                className="bg-white/10 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-white/15 transition-colors"
              >
                <p className="text-xs sm:text-sm text-white/60">Total</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {cryptoStats.totalSells}
                </h2>
              </div>

              <div
                onClick={() => handleCryptoFilter('completed')}
                className="bg-green-600 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
              >
                <p className="text-xs sm:text-sm text-white/80">Completed</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {cryptoStats.successfulSells}
                </h2>
              </div>

              <div
                onClick={() => handlePendingCrypto()}
                className="bg-[rgb(255,240,120)] p-3 sm:p-4 rounded-lg text-black cursor-pointer hover:opacity-90 transition-opacity"
              >
                <p className="text-xs sm:text-sm text-black/70">Pending</p>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {cryptoStats.pendingSells}
                </h2>
              </div>

              <div
                onClick={() => handleFailedCrypto()}
                className="bg-red-600 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
              >
                <p className="text-xs sm:text-sm text-white/80">Failed</p>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {cryptoStats.failedSells}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RECENT TRANSACTIONS ================= */}
        <div className="bg-black rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold mb-4 text-sm sm:text-base text-[rgb(255,240,120)]">Recent Transactions (Gift Cards & Crypto Sells)</h3>

          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/15 transition-colors"
                onClick={() => navigate(`/admin/transaction/${tx.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {tx.isCrypto ? (
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        {tx.coinIcon}
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[rgb(255,240,120)]/20 rounded-lg flex items-center justify-center">
                        <BsGiftFill className="text-[rgb(255,240,120)] text-xl" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-white/40">User</p>
                      <p className="font-semibold text-sm text-white">{userMap[tx.userId] || "Unknown User"}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle(tx.status)}`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-white/40">Type</p>
                    <p className="font-medium text-white">{tx.displayType}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Amount</p>
                    <p className="font-medium text-white">{formatAmount(tx)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/40">Date</p>
                    <p className="font-medium text-white">{tx.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 text-left text-white/40 font-semibold text-xs uppercase tracking-wider">User</th>
                  <th className="py-3 text-left text-white/40 font-semibold text-xs uppercase tracking-wider">Type</th>
                  <th className="py-3 text-left text-white/40 font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="py-3 text-left text-white/40 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="py-3 text-left text-white/40 font-semibold text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>

              <tbody>
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/transaction/${tx.id}`)}
                  >
                    <td className="py-3 text-white">
                      {userMap[tx.userId] || "Unknown User"}
                    </td>
                    <td className="py-3 text-white">
                      {tx.isCrypto ? (
                        <span className="flex items-center gap-2">
                          {tx.coinIcon}
                          <span>{tx.displayType}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <BsGiftFill className="text-[rgb(255,240,120)]" />
                          <span>{tx.displayType}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-semibold text-white">
                      {formatAmount(tx)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(tx.status)}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-white/60">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {recentTransactions.length === 0 && (
            <div className="text-center py-8 text-white/40">
              <p>No recent transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;