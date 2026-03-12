import React, { useState, useEffect } from "react";
import { Sidebarpage } from "./Sidebarpage";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { BsGiftFill } from "react-icons/bs";
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
  BTC: <SiBitcoin className="text-3xl bg-orange-100 text-orange-600" />,
  ETH: <SiEthereum className="text-3xl bg-indigo-100 text-indigo-600" />,
  USDT: <SiTether className="text-3xl bg-green-100 text-green-600" />,
  USDC: <SiTether className="text-3xl bg-blue-100 text-blue-600" />,
  TRX: <img src={trxIcon} alt="TRX" className="w-8 h-8 bg-red-100 text-red-600" />,
  BCH: <SiBitcoincash className="text-3xl bg-cyan-100 text-cyan-600" />,
  DASH: <SiDash className="text-3xl bg-gray-100 text-gray-600" />,
  LTC: <SiLitecoin className="text-3xl bg-blue-100 text-blue-600" />,
  BNB: <SiBinance className="text-3xl bg-yellow-100 text-yellow-600" />,
  XRP: <SiRipple className="text-3xl bg-gray-800 text-gray-100" />,
  DOGE: <SiDogecoin className="text-3xl bg-yellow-100 text-yellow-600" />,
  BUSD: <SiBinance className="text-3xl bg-yellow-50 text-yellow-500" />,
};

const CRYPTO_COINS = [
  'BTC','ETH','USDT','USDC','LTC',
  'TRX','BCH','BNB','DASH','XRP',
  'DOGE','BUSD'
];

const SuccessfulTransactions = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [giftCardTransactions, setGiftCardTransactions] = useState([]);
  const [cryptoTransactions, setCryptoTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [userMap, setUserMap] = useState({});
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigate = useNavigate();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    fetchTransactions();
  }, [dateRange, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersSnap = await getDocs(collection(db, "users"));
      const map = {};
      usersSnap.forEach((doc) => {
        map[doc.id] = doc.data().fullName || "Unknown User";
      });
      setUserMap(map);

      // Build query based on date range
      let transactionsQuery = collection(db, "transactionHistory");
      
      if (dateRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        transactionsQuery = query(
          collection(db, "transactionHistory"),
          where("time", ">=", Timestamp.fromDate(today)),
          where("time", "<", Timestamp.fromDate(tomorrow))
        );
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        transactionsQuery = query(
          collection(db, "transactionHistory"),
          where("time", ">=", Timestamp.fromDate(weekAgo))
        );
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        transactionsQuery = query(
          collection(db, "transactionHistory"),
          where("time", ">=", Timestamp.fromDate(monthAgo))
        );
      } else if (dateRange === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        transactionsQuery = query(
          collection(db, "transactionHistory"),
          where("time", ">=", Timestamp.fromDate(start)),
          where("time", "<=", Timestamp.fromDate(end))
        );
      }

      const snap = await getDocs(transactionsQuery);
      
      let allTransactions = [];
      let giftCards = [];
      let crypto = [];
      let revenue = 0;

      for (const docSnapshot of snap.docs) {
        const tx = docSnapshot.data();
        
        // Only include completed transactions
        if (tx.status !== "Completed") continue;

        const coin = (tx.coin || tx.asset || '').toUpperCase();
        const timestamp = tx.time || tx.createdAt;
        const dateObj = timestamp?.toDate();

        if (CRYPTO_COINS.includes(coin)) {
          const direction = tx.direction?.toUpperCase() || (tx.nairaValue > 0 ? 'SELL' : 'DEPOSIT');
          
          if (direction === 'SELL') {
            // Extract USD amount for crypto transactions
            const usdAmount = parseFloat(tx.amount || tx.usdValue || 0);
            const cryptoAmount = parseFloat(tx.cryptoAmount || 0);
            const nairaAmount = parseFloat(tx.nairaValue || 0);
            
            const txData = {
              id: docSnapshot.id,
              ...tx,
              timestamp: dateObj || new Date(0),
              type: 'crypto',
              coin,
              displayName: `Sell ${coin}`,
              cryptoAmount: cryptoAmount,
              usdAmount: usdAmount,
              amount: nairaAmount,
              userName: map[tx.userId] || "Unknown User",
              icon: COIN_ICONS[coin],
              isCrypto: true,
            };
            
            crypto.push(txData);
            allTransactions.push(txData);
            revenue += nairaAmount;
          }
        } else if (tx.giftCard || tx.type === 'giftcard') {
          // For gift cards, extract USD value safely
             let usdAmount = 0;

           if (tx.value !== undefined && tx.value !== null) {
              // Handles "$300", "300", 300
             usdAmount = Number(
              String(tx.value).replace(/[^0-9.]/g, "")
                 );
            } else if (tx.amount !== undefined && tx.amount !== null) {
              usdAmount = Number(
              String(tx.amount).replace(/[^0-9.]/g, "")
               );
              } else if (tx.cardValue !== undefined && tx.cardValue !== null) {
               usdAmount = Number(
               String(tx.cardValue).replace(/[^0-9.]/g, "")
                );
               } else if (tx.usdValue !== undefined && tx.usdValue !== null) {
                   usdAmount = Number(tx.usdValue);
               }
          
          // If USD amount is 0 but we have Naira and rate, calculate USD
          if (usdAmount === 0 && tx.rate) {
            const nairaAmount = parseFloat(tx.totalNaira || tx.nairaValue || 0);
            const rate = parseFloat(tx.rate);
            if (rate > 0) {
              usdAmount = nairaAmount / rate;
            }
          }
          
          const nairaAmount = parseFloat(tx.totalNaira || tx.nairaValue || 0);
          
          const txData = {
            id: docSnapshot.id,
            ...tx,
            timestamp: dateObj || new Date(0),
            type: 'giftcard',
            displayName: `Gift Card - ${tx.giftCard || 'Unknown'}`,
            amount: nairaAmount,
            usdAmount: usdAmount,
            userName: map[tx.userId] || "Unknown User",
            giftCardName: tx.giftCard || tx.cardType || 'Unknown',
            isCrypto: false,
          };
          
          giftCards.push(txData);
          allTransactions.push(txData);
          revenue += nairaAmount;
          
          // Debug log for gift cards
          console.log('Gift Card Transaction:', {
            id: docSnapshot.id,
            giftCardName: tx.giftCard,
            usdAmount: usdAmount,
            nairaAmount: nairaAmount,
            rate: tx.rate,
            fields: Object.keys(tx)
          });
        }
      }

      // Sort by timestamp
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      giftCards.sort((a, b) => b.timestamp - a.timestamp);
      crypto.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(allTransactions);
      setGiftCardTransactions(giftCards);
      setCryptoTransactions(crypto);
      setTotalRevenue(revenue);
      
      // Debug logs
      console.log('Total transactions:', allTransactions.length);
      console.log('Gift cards:', giftCards.length);
      console.log('Crypto:', crypto.length);
      console.log('Sample gift card:', giftCards[0]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTransactions = () => {
    switch (activeTab) {
      case "giftCards":
        return giftCardTransactions;
      case "sellCoins":
        return cryptoTransactions;
      default:
        return transactions;
    }
  };

  const displayTransactions = getDisplayTransactions();

  const formatDate = (date) => {
    if (!date) return "Unknown date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      currencyDisplay: "narrowSymbol",
    }).format(amount || 0);
  };

  const formatUSD = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case "today":
        return "Today";
      case "week":
        return "Last 7 days";
      case "month":
        return "Last 30 days";
      case "custom":
        return startDate && endDate 
          ? `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
          : "Custom Range";
      default:
        return "All Time";
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setShowDatePicker(false);
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      setDateRange("custom");
      setShowDatePicker(false);
    }
  };

  // Add a function to refresh data
  const handleRefresh = () => {
    fetchTransactions();
  };

  return (
    <div className="bg-[rgb(255,240,120)] w-full md:pt-0 pt-20 min-h-screen flex">
      <div className={`${isCollapsed ? 'md:mr-24' : 'md:mr-52'}`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex-1 px-4 sm:px-8 py-4 md:pt-8 pt-8 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-black/60 hover:text-black font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-black mb-2">Successful Transactions</h1>
            <p className="text-black/60">All successfully processed transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-black text-[rgb(255,240,120)] rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="text-sm text-white bg-black px-4 py-2 rounded-lg border border-white/20 hover:opacity-90 flex items-center gap-2"
              >
                <span>{getDateRangeText()}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-64 bg-black rounded-lg shadow-lg border border-white/10 z-10 p-4">
                  <div className="space-y-1">
                    {["all", "today", "week", "month"].map((range) => (
                      <button
                        key={range}
                        onClick={() => handleDateRangeChange(range)}
                        className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-white transition-colors"
                      >
                        {range === "all" ? "All Time" : range === "today" ? "Today" : range === "week" ? "Last 7 days" : "Last 30 days"}
                      </button>
                    ))}
                    <div className="border-t border-white/10 pt-3 mt-2">
                      <p className="text-xs text-white/40 mb-2">Custom Range</p>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                        />
                        <button
                          onClick={handleCustomDateApply}
                          disabled={!startDate || !endDate}
                          className="w-full bg-[rgb(255,240,120)] text-black py-2 text-sm rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm font-medium">Total Amount Sent Out</p>
                <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-[rgb(255,240,120)] font-bold text-lg">₦</span>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-1">
                  {transactions.length}
                </p>
                <p className="text-xs text-white/30 mt-1">
                  {giftCardTransactions.length} gift cards, {cryptoTransactions.length} crypto
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-1">
                  {Object.keys(userMap).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.205a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { key: "all", label: `All Transactions (${transactions.length})` },
            { key: "giftCards", label: `Gift Cards (${giftCardTransactions.length})` },
            { key: "sellCoins", label: `Sell Coins (${cryptoTransactions.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-full font-medium transition-all text-sm md:text-base ${
                activeTab === key
                  ? "bg-black text-[rgb(255,240,120)] shadow-md"
                  : "bg-black/30 text-black hover:bg-black/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="bg-black rounded-xl shadow-sm border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(255,240,120)] mx-auto"></div>
                <p className="text-white/40 mt-4">Loading transactions...</p>
              </div>
            ) : displayTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mt-4">No transactions found</h3>
                <p className="text-white/40 mt-1">
                  {activeTab === "all"
                    ? "No completed transactions yet."
                    : activeTab === "giftCards"
                    ? "No gift card transactions found."
                    : "No crypto sell transactions found."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <table className="min-w-full hidden md:table">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">USD Value</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">NGN Value</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {transaction.isCrypto ? (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                  {transaction.icon || <SiBitcoin className="text-xl text-orange-400" />}
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[rgb(255,240,120)]/20 flex items-center justify-center">
                                  <BsGiftFill className="text-xl text-[rgb(255,240,120)]" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {transaction.isCrypto
                                  ? `Sell ${transaction.coin}`
                                  : `Gift Card - ${transaction.giftCardName || 'Unknown'}`}
                              </div>
                              <div className="text-xs text-white/40">{transaction.userName || 'User'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{transaction.userName}</div>
                          <div className="text-xs text-white/40 truncate max-w-[150px]">{transaction.userId || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[rgb(255,240,120)]">
                            {formatUSD(transaction.usdAmount)}
                          </div>
                          {transaction.isCrypto && transaction.cryptoAmount > 0 && (
                            <div className="text-xs text-white/40">
                              {Number(transaction.cryptoAmount).toFixed(8)} {transaction.coin}
                            </div>
                          )}
                          {!transaction.isCrypto && transaction.rate && (
                            <div className="text-xs text-white/40">
                              Rate: ₦{Number(transaction.rate).toFixed(2)}/$
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-400">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.isCrypto
                              ? 'bg-white/10 text-white/70'
                              : 'bg-[rgb(255,240,120)]/20 text-[rgb(255,240,120)]'
                          }`}>
                            {transaction.isCrypto ? 'Crypto' : 'Gift Card'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-white/5">
                  {displayTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {transaction.isCrypto ? (
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                              {transaction.icon || <SiBitcoin className="text-xl text-orange-400" />}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[rgb(255,240,120)]/20 flex items-center justify-center">
                              <BsGiftFill className="text-xl text-[rgb(255,240,120)]" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">
                              {transaction.isCrypto
                                ? `Sell ${transaction.coin}`
                                : `Gift Card - ${transaction.giftCardName || 'Unknown'}`}
                            </div>
                            <div className="text-sm text-white/40">{transaction.userName}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.isCrypto
                            ? 'bg-white/10 text-white/70'
                            : 'bg-[rgb(255,240,120)]/20 text-[rgb(255,240,120)]'
                        }`}>
                          {transaction.isCrypto ? 'Crypto' : 'Gift Card'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-white/40">USD Value</div>
                          <div className="font-semibold text-[rgb(255,240,120)]">{formatUSD(transaction.usdAmount)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">NGN Value</div>
                          <div className="font-semibold text-green-400">{formatCurrency(transaction.amount)}</div>
                        </div>
                        {transaction.isCrypto && transaction.cryptoAmount > 0 && (
                          <div>
                            <div className="text-white/40">Crypto Amount</div>
                            <div className="font-medium text-white">
                              {Number(transaction.cryptoAmount).toFixed(8)} {transaction.coin}
                            </div>
                          </div>
                        )}
                        {!transaction.isCrypto && transaction.rate && (
                          <div>
                            <div className="text-white/40">Rate</div>
                            <div className="text-white">₦{Number(transaction.rate).toFixed(2)}/$</div>
                          </div>
                        )}
                        <div className="col-span-2">
                          <div className="text-white/40">Date</div>
                          <div className="text-white/70">{formatDate(transaction.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessfulTransactions;