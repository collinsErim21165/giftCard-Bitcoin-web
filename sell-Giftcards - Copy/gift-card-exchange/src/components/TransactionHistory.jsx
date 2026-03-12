// src/components/TransactionHistory.js
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Bank logos
import Access from "../assets/access_bank.png";
import UBA from "../assets/Uba.png";
import Gtbank from "../assets/guaranty-trust-bank.svg";
import Zenith from "../assets/zenith-bank.png";
import FirstBank from "../assets/first-bank-nigeria.png";
import OPay from "../assets/opay.png";
import MoniepointLogo from "../assets/Moniepoint.svg";
import KudaLogo from "../assets/Kuda.svg";
import PalmPayLogo from "../assets/palmpay.png";

// Icons
import { FaCalendarAlt, FaReceipt, FaCheckCircle, FaClock, FaTimesCircle, FaImage, FaDownload } from "react-icons/fa";
import { BsBank } from "react-icons/bs";
import { AiOutlineTransaction } from "react-icons/ai";

// Bank logo mapping
const bankLogos = {
  "zenith bank": Zenith,
  "zenith": Zenith,
  "gtbank": Gtbank,
  "gt bank": Gtbank,
  "first bank": FirstBank,
  "firstbank": FirstBank,
  "uba": UBA,
  "access bank": Access,
  "access": Access,
  "opay": OPay,
  "moniepoint": MoniepointLogo,
  "kuda bank": KudaLogo,
  "kuda": KudaLogo,
  "palmpay": PalmPayLogo,
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const transactionsPerPage = 20;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const userTransactions = data.transactions || [];

        // Sort transactions by date (newest first)
        const sortedTransactions = userTransactions.sort((a, b) =>
          new Date(b.date) - new Date(a.date)
        );

        setTransactions(sortedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openTransactionPopup = (transaction) => {
    setSelectedTransaction(transaction);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedTransaction(null);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-white/40" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return 'text-green-400';
      case 'withdrawal':
        return 'text-white/60';
      case 'giftcard sale':
        return 'text-purple-400';
      default:
        return 'text-white/40';
    }
  };

  // Filter and Pagination Logic
  const allFilteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.status?.toLowerCase() === filter.toLowerCase();
  });

  const displayedTransactions = allFilteredTransactions.slice(0, page * transactionsPerPage);

  // Update hasMore based on whether there are more transactions to show
  useEffect(() => {
    setHasMore(allFilteredTransactions.length > displayedTransactions.length);
  }, [allFilteredTransactions.length, displayedTransactions.length]);

  const loadMoreTransactions = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
  };

  const downloadReceipt = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-black rounded-xl border border-white/10">
      {/* Remove min-h-screen and make it auto height */}
      
      {/* Style for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6"> {/* Reduced margin from mb-8 to mb-6 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4"> {/* Reduced margin from mb-6 to mb-4 */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[rgb(255,240,120)] mb-1"> {/* Reduced text size */}
                <AiOutlineTransaction className="inline-block mr-2" />
                Bank History
              </h1>
              <p className="text-sm text-white/40"> {/* Reduced text size */}
                View all your withdrawals
              </p>
            </div>

            <div className="mt-3 md:mt-0"> {/* Reduced margin */}
              <div className="inline-flex rounded-lg bg-white/10 p-1">
                {["all", "completed", "pending", "failed"].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => { setFilter(filterType); setPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === filterType
                      ? "bg-[rgb(255,240,120)] text-black shadow"
                      : "text-white/60 hover:text-white hover:bg-white/20"
                      }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View - Cards with reduced height */}
        <div className="md:hidden">
          <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(255,240,120)] mx-auto"></div>
                <p className="mt-3 text-sm text-white/40">Loading transactions...</p>
              </div>
            ) : displayedTransactions.length > 0 ? (
              <div className="space-y-3 pb-2">
                {displayedTransactions.map((transaction, index) => {
                  const bankName = typeof transaction.bank === "string"
                    ? transaction.bank
                    : transaction.bank?.name || "Unknown Bank";

                  const logoKey = bankName.toLowerCase().trim();
                  const logoSrc = bankLogos[logoKey] || "/images/amazon.png";
                  const formattedDate = formatDate(transaction.date);
                  const hasReceipt = transaction.receiptImage;

                  return (
                    <div
                      key={index}
                      onClick={() => openTransactionPopup(transaction)}
                      className="bg-white/5 rounded-lg p-3 shadow-lg border border-white/10 active:scale-95 transition-transform"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs text-white/40">
                            #{index + 1}
                          </div>
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                            {getStatusIcon(transaction.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">{transaction.type || "Transaction"}</h3>
                            <p className="text-xs text-white/40">{formattedDate.date} • {formattedDate.time}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-2 p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center">
                          <img
                            src={logoSrc}
                            alt={`${bankName}`}
                            className="w-6 h-6 rounded-full object-cover mr-2"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/24"; }}
                          />
                          <span className="text-xs text-white/60">{bankName}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-white">₦{transaction.amount?.toLocaleString()}</p>
                          {transaction.fee && <p className="text-xs text-white/30">Fee: ₦{transaction.fee}</p>}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTransactionPopup(transaction);
                          }}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[rgb(255,240,120)] rounded-lg text-xs transition-colors flex items-center"
                        >
                          <FaReceipt className="mr-1" size={12} /> Details
                        </button>
                        {hasReceipt && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReceipt(hasReceipt);
                            }}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-green-400 rounded-lg text-xs transition-colors flex items-center"
                          >
                            <FaDownload className="mr-1" size={12} /> Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Load More Button for Mobile */}
                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={loadMoreTransactions}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/5 rounded-lg">
                <BsBank className="text-3xl mx-auto mb-2 text-white/20" />
                <p className="text-sm text-white/40">No transactions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View - Scrollable Table container (unchanged) */}
        <div className="hidden md:block">
          <div className="bg-black rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[80vh] custom-scrollbar">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(255,240,120)]"></div>
                        </div>
                        <p className="mt-3 text-sm text-white/40">Loading transactions...</p>
                      </td>
                    </tr>
                  ) : displayedTransactions.length > 0 ? (
                    displayedTransactions.map((transaction, index) => {
                      const bankName = typeof transaction.bank === "string"
                        ? transaction.bank
                        : transaction.bank?.name || "Unknown Bank";

                      const logoKey = bankName.toLowerCase().trim();
                      const logoSrc = bankLogos[logoKey] || "/images/amazon.png";
                      const formattedDate = formatDate(transaction.date);
                      const hasReceipt = transaction.receiptImage;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                          onClick={() => openTransactionPopup(transaction)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-white/40 font-medium">
                            #{index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-white/10">
                                {getStatusIcon(transaction.status)}
                              </div>
                              <div className="ml-3">
                                <div className="text-xs font-bold text-white">
                                  {transaction.type || "Transaction"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={logoSrc}
                                alt={`${bankName} logo`}
                                className="h-6 w-6 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/24";
                                  e.target.onerror = null;
                                }}
                              />
                              <div className="ml-2">
                                <div className="text-xs font-medium text-white">
                                  {bankName}
                                </div>
                                <div className={`text-xs ${getTransactionTypeColor(transaction.type)}`}>
                                  {transaction.type || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-xs font-bold text-white">
                              ₦{transaction.amount?.toLocaleString() || "0"}
                            </div>
                            {transaction.fee && (
                              <div className="text-xs text-white/40">
                                Fee: ₦{transaction.fee}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-xs text-white">{formattedDate.date}</div>
                            <div className="text-xs text-white/40">{formattedDate.time}</div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              <span className="ml-1">
                                {transaction.status?.toUpperCase() || "PENDING"}
                              </span>
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTransactionPopup(transaction);
                                }}
                                className="text-[rgb(255,240,120)] hover:opacity-70 transition-colors"
                                title="View Details"
                              >
                                <FaReceipt size={16} />
                              </button>
                              {hasReceipt && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadReceipt(hasReceipt);
                                  }}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Download Receipt"
                                >
                                  <FaDownload size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center">
                        <div className="text-white/40">
                          <BsBank className="text-4xl mx-auto mb-3 text-white/20 opacity-50" />
                          <p className="text-sm">No transactions found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Load More Button for Desktop */}
            {hasMore && (
              <div className="border-t border-white/10 p-3 bg-white/5">
                <div className="text-center">
                  <button
                    onClick={loadMoreTransactions}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Popup Modal - Keep as is */}
        {popupOpen && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex md:items-center items-start justify-center z-50 mb-10 p-4 pt-24 md:pt-4">
            <div className="bg-[rgb(18,18,18)] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl">
              {/* ... popup content remains the same ... */}
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Transaction Details
                    </h2>
                    <p className="text-white/40">
                      {selectedTransaction.type || "Transaction"} • {formatDate(selectedTransaction.date).full}
                    </p>
                  </div>
                  <button
                    onClick={closePopup}
                    className="text-white/40 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Transaction Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    {/* Amount Card */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Amount</h3>
                        <span className={`text-2xl font-bold ${selectedTransaction.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                          {selectedTransaction.type === 'withdrawal' ? '-' : '+'}₦{selectedTransaction.amount?.toLocaleString()}
                        </span>
                      </div>
                      {selectedTransaction.fee && (
                        <div className="flex justify-between text-sm text-white/40">
                          <span>Transaction Fee:</span>
                          <span>₦{selectedTransaction.fee}</span>
                        </div>
                      )}
                    </div>

                    {/* Bank Details Card */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <BsBank className="mr-2" />
                        Bank Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-white/40 w-32">Bank Name:</span>
                          <span className="text-white font-medium">
                            {typeof selectedTransaction.bank === "string"
                              ? selectedTransaction.bank
                              : selectedTransaction.bank?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-white/40 w-32">Account Number:</span>
                          <span className="text-white font-medium">
                            {selectedTransaction.bank?.accountNumber || selectedTransaction.accountNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-white/40 w-32">Account Name:</span>
                          <span className="text-white font-medium">
                            {selectedTransaction.bank?.accountName || selectedTransaction.accountName || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                          {getStatusIcon(selectedTransaction.status)}
                          <span className="ml-2">
                            {selectedTransaction.status?.toUpperCase() || "PENDING"}
                          </span>
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-white/40">Transaction Type</div>
                          <div className={`font-medium ${getTransactionTypeColor(selectedTransaction.type)}`}>
                            {selectedTransaction.type?.toUpperCase() || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Receipt */}
                  <div className="space-y-6">
                    {/* Bank Receipt Image */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FaImage className="mr-2" />
                        Bank Transfer Receipt
                      </h3>

                      {selectedTransaction.receiptImage ? (
                        <div className="space-y-4">
                          <div className="relative bg-black rounded-lg overflow-hidden">
                            <img
                              src={selectedTransaction.receiptImage}
                              alt="Bank transfer receipt"
                              className="w-full h-auto max-h-80 object-contain"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400x300?text=Receipt+Not+Available";
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => downloadReceipt(selectedTransaction.receiptImage)}
                              className="flex items-center justify-center px-4 py-2 bg-[rgb(255,240,120)] text-black rounded-lg hover:opacity-90 transition-colors"
                            >
                              <FaDownload className="mr-2" />
                              Download Receipt
                            </button>
                            <span className="text-sm text-green-400 flex items-center">
                              <FaCheckCircle className="mr-2" />
                              Verified Receipt
                            </span>
                          </div>
                        </div>
                      ) : selectedTransaction.status?.toLowerCase() === 'completed' && selectedTransaction.type === 'withdrawal' ? (
                        <div className="text-center py-12">
                          <div className="text-white/40 mb-4">
                            <FaImage className="text-5xl mx-auto opacity-50" />
                          </div>
                          <p className="text-white/60 mb-2">No receipt uploaded</p>
                          <p className="text-sm text-white/30">
                            Admin hasn't uploaded a receipt for this withdrawal yet
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-white/40 mb-4">
                            <FaClock className="text-5xl mx-auto opacity-50" />
                          </div>
                          <p className="text-white/60 mb-2">
                            {selectedTransaction.status?.toLowerCase() === 'pending'
                              ? "Receipt will appear after completion"
                              : "Receipt not required for this transaction type"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Transaction Notes */}
                    {(selectedTransaction.note || selectedTransaction.reference) && (
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
                        <div className="space-y-3">
                          {selectedTransaction.reference && (
                            <div className="flex items-center">
                              <span className="text-white/40 w-32">Reference:</span>
                              <span className="text-white/80 font-mono bg-white/10 px-2 py-1 rounded">
                                {selectedTransaction.reference}
                              </span>
                            </div>
                          )}
                          {selectedTransaction.note && (
                            <div>
                              <span className="text-white/40 block mb-1">Note:</span>
                              <p className="text-white/80 bg-white/10 p-3 rounded-lg">
                                {selectedTransaction.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                  <button
                    onClick={closePopup}
                    className="px-6 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;