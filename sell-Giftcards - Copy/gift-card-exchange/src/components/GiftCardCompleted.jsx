import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Sidebarpage } from './Sidebarpage';
import { useNavigate } from 'react-router-dom';

// Gift Card Icons
import {
  BsGift,
  BsArrowDown,
  BsArrowUp,
  BsClock,
  BsCheckCircle,
  BsXCircle,
  BsFilter,
  BsSearch,
  BsCalendar,
  BsCurrencyDollar,
  BsCashCoin,
  BsPercent,
  BsGraphUp,
  BsChevronRight,
  BsChevronLeft,
  BsListUl,
  BsArrowLeft,
  BsCheckCircleFill,
  BsClockFill
} from 'react-icons/bs';

import {
  SiAmazon,
  SiApple,
  SiGoogle,
  SiPlaystation,
  SiSteam,
  SiXbox,
  SiNintendo,
  SiEbay,
  SiWalmart,
  SiTarget,
} from "react-icons/si";

// Gift Card Types and their icons
const GIFT_CARD_TYPES = {
  'Amazon': { icon: <SiAmazon className="text-2xl text-orange-400" />, color: "bg-white/10" },
  'Apple': { icon: <SiApple className="text-2xl text-white/70" />, color: "bg-white/10" },
  'Google Play': { icon: <SiGoogle className="text-2xl text-green-400" />, color: "bg-white/10" },
  'PlayStation': { icon: <SiPlaystation className="text-2xl text-blue-400" />, color: "bg-white/10" },
  'Steam': { icon: <SiSteam className="text-2xl text-white/70" />, color: "bg-white/10" },
  'Xbox': { icon: <SiXbox className="text-2xl text-green-400" />, color: "bg-white/10" },
  'Nintendo': { icon: <SiNintendo className="text-2xl text-red-400" />, color: "bg-white/10" },
  'eBay': { icon: <SiEbay className="text-2xl text-blue-400" />, color: "bg-white/10" },
  'Walmart': { icon: <SiWalmart className="text-2xl text-blue-400" />, color: "bg-white/10" },
  'Target': { icon: <SiTarget className="text-2xl text-red-400" />, color: "bg-white/10" },
  'Best Buy': { icon: <SiWalmart className="text-2xl text-blue-400" />, color: "bg-white/10" },
};

// Add more gift card brands from your submit page
const GIFT_CARD_BRANDS = [
  'Amazon', 'Apple', 'Google Play', 'PlayStation', 'Steam', 'Xbox',
  'Nintendo', 'eBay', 'Walmart', 'Target', 'Best Buy', 'GooglePlay',
  'CVS', 'American_Express', 'Sephora', 'Coach', 'Nike', 'Nordstrom',
  'FootLocker'
];

const GiftCardCompleted = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [brandStats, setBrandStats] = useState({});
  const [userMap, setUserMap] = useState({});
  const [totalStats, setTotalStats] = useState({
    totalUsdVolume: 0,
    totalNairaRevenue: 0,
    transactionCount: 0,
    totalPlatformRevenue: 0,
    totalCost: 0
  });
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [viewMode, setViewMode] = useState('overview');

  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

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

  const fetchCompletedGiftCardTransactions = async (userMapData = {}) => {
    try {
      setLoading(true);
      setError(null);

      const rows = [];
      const stats = {};
      let totalUsd = 0;
      let totalNgn = 0;
      let totalCommission = 0;
      let totalCost = 0;

      // Helper function to process a transaction
      const processTransaction = (tx, docId, userId = null) => {
        // Check if this is a COMPLETED gift card transaction
        const isCompleted =
          tx.status === 'Completed' ||
          tx.status === 'completed' ||
          tx.status === 'COMPLETED' ||
          tx.status === 'Success' ||
          tx.status === 'success' ||
          tx.status === 'SUCCESS' ||
          tx.status === 'Approved' ||
          tx.status === 'approved';

        // Check if this is a gift card transaction
        const isGiftCard =
          tx.giftCard ||
          tx.brand ||
          tx.type === 'giftcard' ||
          tx.transactionType === 'giftcard' ||
          (tx.productType && tx.productType.includes('gift')) ||
          (tx.notes && tx.notes.includes('gift')) ||
          tx.cardCode ||
          tx.cardPin ||
          (tx.category && tx.category.includes('gift'));

        if (!isGiftCard || !isCompleted) return false;

        // Extract brand
        let brand = tx.brand || tx.giftCard || tx.cardBrand ||
          (tx.productType && tx.productType.split(' ')[0]) ||
          (tx.category && tx.category.split(' ')[0]) ||
          'Unknown';

        // Clean up brand name
        brand = brand.replace(/_/g, ' ').trim();
        if (brand === 'GooglePlay') brand = 'Google Play';
        if (brand === 'American_Express') brand = 'American Express';

        // Parse original amount and currency - FIXED VERSION
        let originalAmount = 0;
        let originalCurrency = 'USD';

        if (tx.value) {
          const valueStr = tx.value.toString();
          // Try to extract currency and amount
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
          } else {
            originalAmount = Number(valueStr.replace(/[^\d.-]/g, '')) || 0;
            originalCurrency = tx.currency || 'USD';
          }
        } else if (tx.amount) {
          originalAmount = Number(tx.amount);
          originalCurrency = tx.currency || 'USD';
        }

        // Get rate
        let rate = Number(tx.rate || tx.exchangeRate || tx.currencyRate || 0);

        // Parse Naira amount
        let nairaAmount = 0;
        if (tx.totalNaira !== undefined && tx.totalNaira !== null) {
          nairaAmount = Number(tx.totalNaira);
        } else if (tx.nairaAmount !== undefined && tx.nairaAmount !== null) {
          nairaAmount = Number(tx.nairaAmount);
        } else if (tx.amountNGN !== undefined && tx.amountNGN !== null) {
          nairaAmount = Number(tx.amountNGN);
        }

        // Calculate USD equivalent
        let usdEquivalent = 0;
        if (nairaAmount > 0 && rate > 0) {
          usdEquivalent = nairaAmount / rate;
        } else {
          usdEquivalent = originalAmount;
        }

        const platformRevenue = Number(tx.platformRevenue || tx.commission || tx.fee || 0);
        const cardCost = Number(tx.cardCost || tx.cost || 0);

        // Get timestamp
        const timestamp = tx.time?.toDate ? tx.time.toDate() :
          tx.createdAt?.toDate ? tx.createdAt.toDate() :
            tx.date?.toDate ? tx.date.toDate() :
              tx.timestamp?.toDate ? tx.timestamp.toDate() :
                tx.completedAt?.toDate ? tx.completedAt.toDate() :
                  new Date(tx.createdAt || tx.date || tx.time || tx.completedAt || Date.now());

        // Initialize brand stats if needed
        if (!stats[brand]) {
          stats[brand] = {
            brand,
            totalUsdEquivalent: 0,
            totalNaira: 0,
            totalPlatformRevenue: 0,
            totalCost: 0,
            transactionCount: 0,
            avgRate: 0,
            rateCount: 0,
            sales: 0,
            transactions: []
          };
        }

        // Update brand stats
        stats[brand].totalUsdEquivalent += usdEquivalent;
        stats[brand].totalNaira += nairaAmount;
        stats[brand].totalPlatformRevenue += platformRevenue;
        stats[brand].totalCost += cardCost;
        stats[brand].transactionCount += 1;
        stats[brand].sales += 1;

        // Calculate running average rate
        if (rate > 0) {
          stats[brand].rateCount += 1;
          stats[brand].avgRate = stats[brand].avgRate + (rate - stats[brand].avgRate) / stats[brand].rateCount;
        }

        // Use the provided userId or get from tx
        const finalUserId = userId || tx.userId || 'unknown';

        // Create transaction object
        const transactionData = {
          id: docId,
          brand,
          type: 'sale',
          originalAmount,
          originalCurrency,
          usdEquivalent,
          nairaAmount,
          platformRevenue,
          cardCost,
          rate,
          timestamp,
          userId: finalUserId,
          userName: userMapData[finalUserId] || "Unknown User",
          status: tx.status || 'Completed',
          cardCode: tx.cardCode || tx.code || '',
          cardPin: tx.cardPin || tx.pin || '',
          country: tx.country || 'US',
          currency: tx.currency || originalCurrency,
          notes: tx.notes || tx.adminNotes || tx.description || '',
          paymentMethod: tx.paymentMethod || tx.payment || '',
          proofImage: tx.proofImage || tx.cardImage || tx.image || '',
          receiptImage: tx.receiptImage || '',
          giftCardValue: tx.value || `${originalAmount}`,
          totalNaira: nairaAmount,
          completedAt: timestamp,
          rawData: tx
        };

        // Add to brand transactions
        stats[brand].transactions.push(transactionData);

        // Update global totals
        totalUsd += usdEquivalent;
        totalNgn += nairaAmount;
        totalCommission += platformRevenue;
        totalCost += cardCost;

        // Add to rows
        rows.push(transactionData);

        return true;
      };

      // Fetch from transactionHistory collection
      try {
        const txRef = collection(db, 'transactionHistory');
        const txSnapshot = await getDocs(txRef);

        txSnapshot.forEach(doc => {
          try {
            const tx = doc.data();
            processTransaction(tx, doc.id);
          } catch (docError) {
            console.error("Error processing document:", doc.id, docError);
          }
        });
      } catch (error) {
        console.log("No transactionHistory collection:", error.message);
      }

      // Sort all transactions by date
      rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Sort transactions for each brand
      Object.values(stats).forEach(brandStat => {
        brandStat.transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      setTransactions(rows);
      setBrandStats(stats);
      setTotalStats({
        totalUsdVolume: totalUsd,
        totalNairaRevenue: totalNgn,
        totalPlatformRevenue: totalCommission,
        totalCost: totalCost,
        transactionCount: rows.length
      });

    } catch (error) {
      console.error("Error fetching completed gift card transactions:", error);
      setError(`Failed to load completed transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await fetchUsers();
      await fetchCompletedGiftCardTransactions(userData);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load completed transactions data");
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

  const formatOriginalCurrency = (amount, currency) => {
    if (!currency || currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    }

    // For other currencies
    const currencySymbols = {
      'CHF': 'CHF',
      'AUD': 'A$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
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
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBack = () => {
    if (viewMode === 'brandDetail') {
      setViewMode('overview');
      setSelectedBrand(null);
    } else {
      navigate(-1);
    }
  };

  const handleTransactionClick = (transactionId) => {
    navigate(`/admin/transaction/${transactionId}`);
  };

  const handleBrandClick = (brand) => {
    if (brand === 'all') {
      setActiveFilter('all');
      setViewMode('overview');
      setSelectedBrand(null);
    } else {
      setActiveFilter(brand);
      setSelectedBrand(brand);
      setViewMode('brandDetail');
      setCurrentPage(1);
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter !== 'all' && tx.brand !== activeFilter) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      tx.brand?.toLowerCase().includes(searchLower) ||
      tx.userName?.toLowerCase().includes(searchLower) ||
      tx.userId?.toLowerCase().includes(searchLower) ||
      tx.cardCode?.toLowerCase().includes(searchLower) ||
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
        ? b.usdEquivalent - a.usdEquivalent
        : a.usdEquivalent - b.usdEquivalent;
    } else if (sortBy === 'naira') {
      return sortOrder === 'desc'
        ? b.nairaAmount - a.nairaAmount
        : a.nairaAmount - b.nairaAmount;
    } else if (sortBy === 'brand') {
      return sortOrder === 'desc'
        ? b.brand.localeCompare(a.brand)
        : a.brand.localeCompare(b.brand);
    }
    return 0;
  });

  // For brand detail view
  const brandDetailTransactions = selectedBrand && brandStats[selectedBrand]
    ? brandStats[selectedBrand].transactions
    : [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const brandStatsArray = Object.values(brandStats).sort((a, b) => b.totalUsdEquivalent - a.totalUsdEquivalent);

  // Get selected brand stats
  const selectedBrandStats = selectedBrand ? brandStats[selectedBrand] : null;

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
            {viewMode === 'brandDetail' ? 'Back to Overview' : 'Back'}
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-black">
                {viewMode === 'brandDetail' && selectedBrand
                  ? `Completed ${selectedBrand} Gift Cards `
                  : 'Completed Gift Card Transactions'
                }
              </h1>
              <p className="text-black/60 mt-1 lg:mt-2 text-sm lg:text-base">
                {viewMode === 'brandDetail' && selectedBrand
                  ? `Completed ${selectedBrand} gift card sales`
                  : 'All successfully completed gift card transactions'
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
              <BsCheckCircleFill className="w-4 h-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                {totalStats.transactionCount} Completed Transactions
              </span>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsCurrencyDollar className="w-4 h-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                Total: {formatUSD(totalStats.totalUsdVolume)}
              </span>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <BsPercent className="w-4 h-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                Commission: {formatCurrency(totalStats.totalPlatformRevenue)}
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
          {!loading && transactions.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
              <p className="text-black/70 text-sm">
                No completed gift card transactions found.
              </p>
              <p className="text-black/60 text-xs mt-1">
                Only transactions with status "Completed", "Success", or "Approved" are shown.
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
                  placeholder="Search completed transactions by brand, user, or card code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 lg:py-3 bg-black text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm lg:text-base"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBrandClick('all')}
                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${activeFilter === 'all' && viewMode === 'overview'
                      ? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'
                      : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'
                      }`}
                  >
                    <BsListUl className="w-4 h-4" />
                    All Brands
                  </button>
                  {GIFT_CARD_BRANDS.map(brand => {
                    const iconBrand = brand === 'GooglePlay' ? 'Google Play' :
                      brand === 'American_Express' ? 'American Express' : brand;

                    return (
                      <button
                        key={brand}
                        onClick={() => handleBrandClick(brand)}
                        className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 ${selectedBrand === brand
                          ? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'
                          : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${GIFT_CARD_TYPES[iconBrand]?.color || 'bg-white/10'}`}>
                          {GIFT_CARD_TYPES[iconBrand]?.icon || <BsGift className="text-xs" />}
                        </div>
                        {brand}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-black text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="usd">Sort by USD Amount</option>
                    <option value="naira">Sort by NGN Amount</option>
                    <option value="brand">Sort by Brand</option>
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

        {/* Selected Brand Dashboard */}
        {viewMode === 'brandDetail' && selectedBrandStats && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${GIFT_CARD_TYPES[selectedBrand]?.color || 'bg-white/10'}`}>
                {GIFT_CARD_TYPES[selectedBrand]?.icon || <BsGift className="text-2xl" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Completed {selectedBrand} Gift Cards</h2>
                <p className="text-black/60">
                  {selectedBrandStats.transactionCount} completed transactions • {formatUSD(selectedBrandStats.totalUsdEquivalent)} total volume
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Completed Volume (USD)</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {formatUSD(selectedBrandStats.totalUsdEquivalent)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedBrandStats.sales} completed sales
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsCheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm font-medium">Total Amount Sent out (NGN)</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {formatCurrency(selectedBrandStats.totalNaira)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Net: {formatCurrency(selectedBrandStats.totalNaira - selectedBrandStats.totalCost)}
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
                    <p className="text-white/40 text-sm font-medium">Platform Revenue</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {formatCurrency(selectedBrandStats.totalPlatformRevenue)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      {selectedBrandStats.totalNaira > 0
                        ? ` ${((selectedBrandStats.totalPlatformRevenue / selectedBrandStats.totalNaira) * 100).toFixed(2)}% of revenue`
                        : 'Commission earned'
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
                    <p className="text-white/40 text-sm font-medium">Avg Completed Sale</p>
                    <p className="text-2xl font-bold text-[rgb(255,240,120)] mt-2">
                      {selectedBrandStats.transactionCount > 0
                        ? formatUSD(selectedBrandStats.totalUsdEquivalent / selectedBrandStats.transactionCount)
                        : formatUSD(0)
                      }
                    </p>
                    <p className="text-sm text-white/40 mt-1">
                      Avg Rate: ₦{selectedBrandStats.avgRate?.toFixed(2)}/$
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <BsGraphUp className="w-6 h-6 text-[rgb(255,240,120)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            {[
              {
                title: "Completed Volume (USD)",
                value: formatUSD(totalStats.totalUsdVolume),
                subtext: ` ${totalStats.transactionCount} completed transactions`,
                bgColor: "bg-white/10",
                textColor: "text-green-400",
                icon: <BsCheckCircle className="w-6 h-6 text-green-400" />
              },
              {
                title: "Total Amount Sent out (NGN)",
                value: formatCurrency(totalStats.totalNairaRevenue),
                subtext: `${brandStatsArray.length} brands`,
                bgColor: "bg-white/10",
                textColor: "text-[rgb(255,240,120)]",
                icon: <BsCashCoin className="w-6 h-6 text-[rgb(255,240,120)]" />
              },
              {
                title: "Platform Revenue",
                value: formatCurrency(totalStats.totalPlatformRevenue),
                subtext: "Total commission earned",
                bgColor: "bg-white/10",
                textColor: "text-purple-400",
                icon: <BsPercent className="w-6 h-6 text-purple-400" />
              },
              {
                title: "Avg Transaction Size",
                value: totalStats.transactionCount > 0
                  ? formatUSD(totalStats.totalUsdVolume / totalStats.transactionCount)
                  : formatUSD(0),
                subtext: "Average completed sale",
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

        {/* Brand Performance */}
        {viewMode === 'overview' && brandStatsArray.length > 0 && (
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-lg font-semibold text-black">Top Performing Brands (Completed)</h3>
              <div className="flex items-center gap-2">
                <BsCheckCircleFill className="w-4 h-4 text-green-400" />
                <span className="text-sm text-black">{totalStats.transactionCount} total completed</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {brandStatsArray.map((brand) => (
                <div
                  key={brand.brand}
                  className="bg-black rounded-lg p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  onClick={() => handleBrandClick(brand.brand)}
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${GIFT_CARD_TYPES[brand.brand]?.color || 'bg-white/10'}`}>
                        {GIFT_CARD_TYPES[brand.brand]?.icon || <BsGift className="text-lg lg:text-xl" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base lg:text-lg">{brand.brand}</h4>
                        <p className="text-xs text-white/40 flex items-center gap-1">
                          <BsCheckCircleFill className="w-3 h-3 text-green-400" />
                          {brand.transactionCount} completed
                        </p>
                      </div>
                    </div>
                    <BsChevronRight className="w-4 h-4 text-white/40" />
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Completed Volume (USD)</p>
                      <p className="font-semibold text-green-400 text-sm lg:text-base">{formatUSD(brand.totalUsdEquivalent)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 mb-1">Revenue (NGN)</p>
                      <p className="font-semibold text-[rgb(255,240,120)] text-sm lg:text-base">{formatCurrency(brand.totalNaira)}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/40">Avg Rate</p>
                        <p className="text-xs lg:text-sm font-medium">₦{brand.avgRate?.toFixed(2) || '0'}/$</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Commission</p>
                        <p className="text-xs lg:text-sm font-medium text-purple-400">
                          {formatCurrency(brand.totalPlatformRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Completed Transactions */}
        <div className="bg-black rounded-xl border border-white/10 overflow-hidden">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[rgb(255,240,120)]">
                  {viewMode === 'brandDetail' && selectedBrand
                    ? ` Completed ${selectedBrand} Transactions (${brandDetailTransactions.length})`
                    : `Recent Completed Transactions (${sortedTransactions.length})`
                  }
                </h3>
                <div className="px-2 py-1 bg-green-100 text-green-400 rounded-full text-xs font-medium">
                  Completed
                </div>
              </div>
              {transactions.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <span className="text-sm text-white/40">
                      Showing only completed transactions
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-8 lg:py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-[rgb(255,240,120)] mx-auto"></div>
              <p className="text-white/40 mt-3 lg:mt-4">Loading completed gift card transactions...</p>
            </div>
          ) : (viewMode === 'brandDetail' ? brandDetailTransactions : sortedTransactions).length === 0 ? (
            <div className="py-8 lg:py-12 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <BsCheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mt-3 lg:mt-4">No completed gift card transactions</h3>
              <p className="text-white/40 mt-1 text-sm lg:text-base">
                {searchTerm || activeFilter !== 'all' || viewMode === 'brandDetail'
                  ? `No completed transactions match your filters`
                  : 'No gift card transactions have been completed yet'
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
                  {(viewMode === 'brandDetail' ? brandDetailTransactions : currentTransactions).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 hover:bg-white/5 cursor-pointer"
                      onClick={() => handleTransactionClick(tx.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${GIFT_CARD_TYPES[tx.brand]?.color || 'bg-white/10'}`}>
                            {GIFT_CARD_TYPES[tx.brand]?.icon || <BsGift className="text-xl" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">{tx.brand}</div>
                            <div className="text-xs text-white/40">{tx.userName}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`inline-block px-2 py-0.5 rounded-full text-xs ${'bg-green-100 text-green-400'
                                }`}>
                                Completed
                              </div>
                              <span className="text-xs text-white/40">
                                {formatShortDate(tx.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-400">
                            {formatOriginalCurrency(tx.originalAmount, tx.originalCurrency)}
                          </div>
                          <div className="text-xs text-white/40">{formatCurrency(tx.nairaAmount)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-white/40">USD Equivalent</div>
                          <div className="font-semibold text-[rgb(255,240,120)]">{formatUSD(tx.usdEquivalent)}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Card Code</div>
                          <div className="font-mono text-[rgb(255,240,120)] truncate">
                            {tx.cardCode || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/40">Rate</div>
                          <div className="text-[rgb(255,240,120)]">₦{tx.rate?.toFixed(2) || '0'}/$</div>
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
                          Brand
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Original Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        USD Equivalent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        NGN Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Completed Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(viewMode === 'brandDetail' ? brandDetailTransactions : currentTransactions).map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleTransactionClick(tx.id)}
                      >
                        {viewMode === 'overview' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${GIFT_CARD_TYPES[tx.brand]?.color || 'bg-white/10'}`}>
                                  {GIFT_CARD_TYPES[tx.brand]?.icon || <BsGift className="text-xl" />}
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-white">{tx.brand}</div>
                                <div className="text-xs text-white/40">Gift Card</div>
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
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-400`}>
                              <div className="flex items-center gap-1">
                                <BsCheckCircle className="w-3 h-3" />
                                {tx.status}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[rgb(255,240,120)]">
                            {formatOriginalCurrency(tx.originalAmount, tx.originalCurrency)}
                          </div>
                          {tx.cardCost > 0 && (
                            <div className="text-xs text-red-400">
                              Cost: {formatCurrency(tx.cardCost)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-400">
                            {formatUSD(tx.usdEquivalent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[rgb(255,240,120)]">
                            {formatCurrency(tx.nairaAmount)}
                          </div>
                          {tx.platformRevenue > 0 && (
                            <div className="text-xs text-purple-400">
                              +{formatCurrency(tx.platformRevenue)} commission
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[rgb(255,240,120)]">
                            ₦{tx.rate?.toFixed(2) || '0'}/$
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/40">
                            {formatDate(tx.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionClick(tx.id);
                            }}
                            className="text-green-400 hover:text-green-400 font-medium text-sm flex items-center gap-1"
                          >
                            View Details
                            <BsChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {viewMode === 'overview' && totalPages > 1 && (
                <div className="px-4 lg:px-6 py-4 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-white/40">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedTransactions.length)} of {sortedTransactions.length} completed transactions
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
                              ? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'
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

        {/* Summary Footer */}
        {transactions.length > 0 && (
          <div className="mt-6 p-4 bg-black border border-white/10 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-medium text-[rgb(255,240,120)]">Completed Transactions Summary</h4>
                <p className="text-sm text-green-400">
                  Total {totalStats.transactionCount} transactions • {formatUSD(totalStats.totalUsdVolume)} USD • {formatCurrency(totalStats.totalNairaRevenue)} NGN
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{formatCurrency(totalStats.totalPlatformRevenue)}</div>
                  <div className="text-xs text-green-400">Platform Revenue</div>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[rgb(255,240,120)]">{brandStatsArray.length}</div>
                  <div className="text-xs text-[rgb(255,240,120)]">Brands</div>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {totalStats.transactionCount > 0
                      ? formatUSD(totalStats.totalUsdVolume / totalStats.transactionCount)
                      : formatUSD(0)
                    }
                  </div>
                  <div className="text-xs text-purple-400">Avg Sale</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardCompleted;