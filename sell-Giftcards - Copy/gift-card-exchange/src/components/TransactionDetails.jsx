import React from 'react';
import { FiX, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { BsGift, BsCalendar, BsCurrencyDollar, BsImage } from 'react-icons/bs';

const TransactionDetails = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const getGiftCardLogo = (type) => {
    switch (type) {
      case 'Amazon':
        return '/images/amazon.png';
      case 'GooglePlay':
        return '/images/google-play.png';
      case 'Steam':
        return '/images/Steam.png';
      case 'Xbox':
        return '/images/Xbox.png';
      case 'Walmart':
        return '/images/Walmart.png';
      case 'CVS':
        return '/images/CVS.png';
      case 'American_Express':
        return '/images/American-Express.png';
      default:
        return '../assets/CVS.png';
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status?.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle className="text-white w-4 h-4 md:w-5 md:h-5" />;
      case 'pending':
        return <FiClock className="text-white w-4 h-4 md:w-5 md:h-5" />;
      default:
        return <FiXCircle className="text-white w-4 h-4 md:w-5 md:h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status?.toLowerCase()) {
      case 'completed':
        return 'bg-[#22c55e] text-white';
      case 'pending':
        return 'bg-[#f97316] text-white';
      default:
        return 'bg-[#ef4444] text-white';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(255,240,120)] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl w-full sm:max-w-md mx-auto animate-slideUp sm:animate-fadeIn border-t sm:border border-black/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-black px-6 py-4 flex justify-between items-center z-10 shadow-lg rounded-t-[2rem] flex-shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-widest">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-all bg-white/10 p-2 rounded-full active:scale-90"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Gift Card Logo and Type */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-black blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <img
                src={getGiftCardLogo(transaction.giftCard)}
                alt={transaction.giftCard}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-2xl bg-black p-3 relative z-10 border-2 border-white/10"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100';
                }}
              />
              <div className="absolute -top-2 -right-2 z-20">
                <div className={`p-2 rounded-full shadow-lg border-2 border-[rgb(255,240,120)] ${getStatusColor()}`}>
                  {getStatusIcon()}
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-2xl sm:text-3xl font-[1000] text-black tracking-tighter uppercase">{transaction.giftCard}</h4>
              <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em] mt-1">Official Asset Receipt</p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between mb-8 p-4 bg-black/5 rounded-2xl border border-black/5">
            <span className="text-black/40 font-black text-[10px] uppercase tracking-widest">Trade Status</span>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="font-black text-[10px] uppercase tracking-widest">{transaction.status}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-2">
            {[
              { label: "Origin Country", value: transaction.country, icon: <BsGift /> },
              { label: "Asset Face Value", value: transaction.value, icon: <BsCurrencyDollar /> },
              { label: "Settlement (NGN)", value: `₦${transaction.totalNaira?.toLocaleString()}`, icon: <BsCurrencyDollar />, isNaira: true },
              { label: "Execution Date", value: transaction.displayDate, icon: <BsCalendar /> }
            ].map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 px-1 border-b border-black/[0.03] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-black/20 text-sm">{detail.icon}</span>
                  <span className="text-black/50 font-black text-[10px] uppercase tracking-wider">
                    {detail.label}
                  </span>
                </div>
                <span className={`font-black text-black text-xs sm:text-sm tracking-tight ${detail.isNaira ? 'text-[#22c55e]' : ''}`}>
                  {detail.value}
                </span>
              </div>
            ))}

            {/* Message */}
            {transaction.message && (
              <div className="mt-6">
                <span className="text-black/30 font-black text-[10px] uppercase tracking-widest block mb-2">Internal Note</span>
                <p className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl text-black/70 text-[11px] font-bold leading-relaxed border border-black/5 whitespace-pre-wrap">
                  {transaction.message}
                </p>
              </div>
            )}
          </div>

          {/* Failed Transaction Screenshot */}
          {transaction.status?.toLowerCase() === 'failed' && transaction.failedScreenshot && (
            <div className="mt-8 p-5 bg-red-500/5 rounded-3xl border border-red-500/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <BsImage className="text-red-600 w-4 h-4" />
                </div>
                <h4 className="font-black text-red-600 text-[10px] uppercase tracking-[0.2em]">Transaction Evidence</h4>
              </div>
              <div className="relative group cursor-pointer" onClick={() => window.open(transaction.failedScreenshot, '_blank')}>
                <img
                  src={transaction.failedScreenshot}
                  alt="Failed transaction screenshot"
                  className="w-full max-h-56 object-contain rounded-2xl border-2 border-red-500/10 shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">View Original</span>
                </div>
              </div>
            </div>
          )}

          {/* Close Action */}
          <button
            onClick={onClose}
            className="w-full mt-10 bg-black text-[rgb(255,240,120)] font-black py-5 px-6 rounded-2xl active:scale-[0.97] hover:scale-[1.01] transition-all uppercase tracking-[0.25em] text-[10px] shadow-2xl"
          >
            Close Receipt
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        @media (min-width: 640px) {
          .sm\\:animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionDetails;
