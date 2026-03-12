import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebarpage } from './Sidebarpage';
import Loader from './Loader';
import usePopup from './usePopup';
import CustomPopup from './CustomPopup';
import Compressor from 'compressorjs';
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
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';
import trxIcon from "../assets/trx.svg";

const AdminTransactionDetails = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [platformRevenue, setPlatformRevenue] = useState('');
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [transactionType, setTransactionType] = useState('');
  const [copied, setCopied] = useState(false);

  // Screenshot upload states
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [existingScreenshot, setExistingScreenshot] = useState(null);
  const fileInputRef = useRef(null);

  const { popup, showPopup, closePopup } = usePopup();

  const COIN_ICONS = {
    BTC: <SiBitcoin className="text-orange-500 md:text-5xl text-4xl" />,
    ETH: <SiEthereum className="text-indigo-500 md:text-5xl text-4xl" />,
    USDT: <SiTether className="text-green-500 md:text-5xl text-4xl" />,
    USDC: <SiTether className="text-blue-500 md:text-5xl text-4xl" />,
    TRX: <img src={trxIcon} alt="TRX" className="md:w-20 md:h-20 w-16 h-16" />,
    BCH: <SiBitcoincash className="text-cyan-500 md:text-5xl text-4xl" />,
    DASH: <SiDash className="text-gray-700 md:text-5xl text-4xl" />,
    LTC: <SiLitecoin className="text-blue-500 md:text-5xl text-4xl" />,
    BNB: <SiBinance className="text-yellow-500 md:text-5xl text-4xl" />,
    XRP: <SiRipple className="text-black md:text-5xl text-4xl" />,
    DOGE: <SiDogecoin className="text-yellow-600 md:text-5xl text-4xl" />,
    BUSD: <SiBinance className="text-yellow-400 md:text-5xl text-4xl" />,
  };

  const CRYPTO_COINS = [
    'BTC', 'ETH', 'USDT', 'USDC', 'LTC',
    'TRX', 'BCH', 'BNB', 'DASH', 'XRP',
    'DOGE', 'BUSD'
  ];

  // Copy user ID to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch the transaction details from Firestore
  useEffect(() => {
    const fetchTransaction = async () => {
      const docRef = doc(db, 'transactionHistory', transactionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const time = (data.time || data.createdAt)?.toDate();

        // Determine transaction type
        const coin = (data.coin || data.asset || '').toUpperCase();
        let txType = '';

        if (CRYPTO_COINS.includes(coin)) {
          const direction = data.direction?.toUpperCase() || (data.nairaValue > 0 ? 'SELL' : 'DEPOSIT');
          txType = direction === 'DEPOSIT' ? 'bitcoin-deposit' : 'bitcoin-sell';
        } else if (data.giftCard) {
          txType = 'giftcard';
        }

        setTransactionType(txType);

        setTransaction({
          ...data,
          displayDate: time ? time.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A',
          displayTime: time ? time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }) : 'N/A',
          displayDateTime: time ? time.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : 'N/A'
        });
        setStatus(data.status || 'Pending');
        setMessage(data.message || '');
        setPlatformRevenue(data.platformRevenue || '');
        setRate(data.rate || '');
        setExistingScreenshot(data.failedScreenshot || null);

        if (data.userId) {
          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUser(userDocSnap.data());
          }
        }
      } else {
        console.log("No such document!");
      }
    };

    fetchTransaction();
  }, [transactionId]);

  const getGiftCardLogo = (type) => {
    const logos = {
      'Amazon': '/images/amazon.png',
      'GooglePlay': '/images/google-play.png',
      'Steam': '/images/Steam.png',
      'Xbox': '/images/Xbox.png',
      'Walmart': '/images/Walmart.png',
      'CVS': '/images/CVS.png',
      'American_Express': '/images/American-Express.png',
    };
    return logos[type] || '../assets/default.png';
  };

  const compressFile = (file) =>
    new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 1024,
        maxHeight: 1024,
        success: resolve,
        error: reject,
      });
    });

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showPopup('error', 'File Too Large', 'Screenshot must be less than 5MB', closePopup);
      return;
    }

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadScreenshot = async () => {
    if (!screenshotFile) return null;

    setUploadingScreenshot(true);
    try {
      const compressedImage = await compressFile(screenshotFile);
      const screenshotRef = ref(storage, `failed-transactions/${transactionId}_${Date.now()}.jpg`);
      await uploadBytes(screenshotRef, compressedImage);
      const screenshotURL = await getDownloadURL(screenshotRef);
      return screenshotURL;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const transactionRef = doc(db, 'transactionHistory', transactionId);
      const updateData = {
        status,
        message,
      };

      if (rate !== '') {
        updateData.rate = Number(rate);
      }

      if ((transactionType === 'giftcard' || transactionType === 'bitcoin-sell') && platformRevenue !== '') {
        updateData.platformRevenue = Number(platformRevenue);
      }

      // Upload screenshot if status is Failed and a new screenshot is selected
      if (status === 'Failed' && screenshotFile) {
        const screenshotURL = await uploadScreenshot();
        if (screenshotURL) {
          updateData.failedScreenshot = screenshotURL;
        }
      }

      await updateDoc(transactionRef, updateData);

      // When a bitcoin sell is marked Completed, clear the pendingBalance
      // so the user's wallet shows 0 (they've been paid)
      if (status === 'Completed' && transactionType === 'bitcoin-sell' && transaction.userId && transaction.coin) {
        const coin = transaction.coin.toUpperCase();

        // Clear from all matching wallet docs in the wallets collection
        const walletsSnap = await getDocs(
          query(collection(db, "wallets"), where("userId", "==", transaction.userId), where("coin", "==", coin))
        );
        const walletClears = walletsSnap.docs.map(walletDoc =>
          updateDoc(walletDoc.ref, { pendingBalance: deleteField() })
        );

        // Clear from users collection nested wallet entry
        const userRef = doc(db, "users", transaction.userId);
        const userClear = updateDoc(userRef, {
          [`wallets.${coin}.pendingBalance`]: deleteField(),
        });

        await Promise.all([...walletClears, userClear]);
      }

      // Update existing screenshot in state
      if (status === 'Failed' && screenshotFile) {
        setExistingScreenshot(updateData.failedScreenshot);
        removeScreenshot();
      }

      showPopup('success', 'Update Successful',
        'The transaction has been updated successfully.',
        () => navigate('/payment-panel')
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      showPopup('error', 'Update Failed', 'Failed to update transaction. Please try again.', closePopup);
    }

    setLoading(false);
  };

  if (!transaction) return <Loader />;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const showRevenueInput = transactionType === 'giftcard' || transactionType === 'bitcoin-sell';

  return (
    <div className="flex flex-col md:flex-row items-start justify-start bg-[rgb(255,240,120)] min-h-screen">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'md:w-20' : 'md:w-48'} w-full md:relative fixed z-30`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className={`admin-transaction-details flex-grow w-full md:pt-3 pt-20 md:px-6 px-4 ${isCollapsed ? 'md:ml-10' : 'md:ml-20'}`}>
        <h3 className='font-bold md:text-2xl text-xl mb-6 text-black'>Transaction Details</h3>

        {/* Display based on transaction type */}
        {transactionType === 'giftcard' ? (
          // Gift Card Transaction Display
          <div className="bg-black rounded-lg shadow-md p-4 md:p-6 mb-6 border border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <img
                src={getGiftCardLogo(transaction.giftCard)}
                alt={transaction.giftCard}
                className="gift-card-logo md:w-40 md:h-40 w-32 h-32 mr-2 mb-4 md:mb-0 rounded-lg"
              />

              <div className="space-y-2 flex-grow">
                <p className="flex flex-wrap items-center gap-0">
                  <strong className="w-40 text-white/60">Transaction Type:</strong>
                  <span className="text-[rgb(255,240,120)] font-semibold">Gift Card</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Gift Card:</strong>
                  <span className="font-mono text-white">{transaction.giftCard}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Value:</strong>
                  <span className="font-bold text-[rgb(255,240,120)]">{transaction.value}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Total Naira:</strong>
                  <span className="font-bold text-green-400">₦{transaction.totalNaira?.toLocaleString()}</span>
                </p>
                {transaction.rate && (
                  <p className="flex flex-wrap items-center gap-1">
                    <strong className="w-32 text-white/60">Exchange Rate:</strong>
                    <span className='text-red-400 font-bold'>₦{Number(transaction.rate).toFixed(2)} /$</span>
                  </p>
                )}
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Date:</strong>
                  <span className="text-white">{transaction.displayDate}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Time:</strong>
                  <span className="text-white">{transaction.displayTime}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">User ID:</strong>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded flex items-center gap-2 text-white text-sm">
                    {transaction.userId}
                    <button
                      onClick={() => copyToClipboard(transaction.userId)}
                      className="text-[rgb(255,240,120)] hover:opacity-70 p-1 rounded transition-colors"
                      title="Copy User ID"
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">User Name:</strong>
                  <span className="text-white">{user ? user.fullName : 'No name available'}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Status:</strong>
                  <span className={`font-semibold ${transaction.status === 'Completed' ? 'text-green-400'
                    : transaction.status === 'Pending' ? 'text-[rgb(255,240,120)]'
                      : 'text-red-400'
                    }`}>
                    {transaction.status}
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="w-32 text-white/60">Message:</strong>
                  <span className="text-white">{message}</span>
                </p>
                {transaction.platformRevenue && (
                  <p className="flex flex-wrap items-center gap-1">
                    <strong className="w-40 text-white/60">Platform Revenue:</strong>
                    <span className="text-[rgb(255,240,120)] font-bold">₦{Number(transaction.platformRevenue).toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Bitcoin Transaction Display
          <div className="bg-black rounded-lg shadow-md p-4 md:p-6 mb-6 border border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 md:p-4 rounded-lg">
                  {COIN_ICONS[transaction.coin?.toUpperCase()] || COIN_ICONS['BTC']}
                </div>
                <div>
                  <h4 className="md:text-2xl text-xl font-bold text-white">{transaction.coin?.toUpperCase()}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${transactionType === 'bitcoin-deposit'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                    }`}>
                    {transactionType === 'bitcoin-deposit' ? 'DEPOSIT' : 'SELL'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 flex-grow">
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-40 w-28 text-white/60">Transaction Type:</strong>
                  <span className="text-[rgb(255,240,120)] font-semibold">Bitcoin {transactionType === 'bitcoin-deposit' ? 'Deposit' : 'Sell'}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">Crypto Amount:</strong>
                  <span className="font-mono text-white">
                    {Number(transaction.cryptoAmount || 0).toFixed(8)} {transaction.coin?.toUpperCase()}
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">USD Amount:</strong>
                  <span className="font-bold text-[rgb(255,240,120)]">
                    ${Number(transaction.amount || transaction.usdAmount || 0).toFixed(2)}
                  </span>
                </p>
                {transaction.nairaValue > 0 && (
                  <p className="flex flex-wrap items-center gap-1">
                    <strong className="md:w-32 w-28 text-white/60">Naira Value:</strong>
                    <span className="font-bold text-green-400">₦{Number(transaction.nairaValue).toLocaleString()}</span>
                  </p>
                )}
                {transactionType === 'bitcoin-sell' && transaction.rate && (
                  <p className="flex flex-wrap items-center gap-1">
                    <strong className="md:w-32 w-28 text-white/60">Exchange Rate:</strong>
                    <span className='text-red-400 font-bold'>₦{Number(transaction.rate).toFixed(2)} /$</span>
                  </p>
                )}
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">Date & Time:</strong>
                  <span className="text-white">{transaction.displayDateTime}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">User ID:</strong>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded flex items-center gap-2 text-white text-sm">
                    {transaction.userId}
                    <button
                      onClick={() => copyToClipboard(transaction.userId)}
                      className="text-[rgb(255,240,120)] hover:opacity-70 p-1 rounded transition-colors"
                      title="Copy User ID"
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">User Name:</strong>
                  <span className="text-white">{user ? user.fullName : 'No name available'}</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">Status:</strong>
                  <span className={`font-semibold ${transaction.status === 'Completed' ? 'text-green-400'
                    : transaction.status === 'Pending' ? 'text-[rgb(255,240,120)]'
                      : 'text-red-400'
                    }`}>
                    {transaction.status}
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  <strong className="md:w-32 w-28 text-white/60">Message:</strong>
                  <span className="text-white">{message}</span>
                </p>
                {transaction.platformRevenue && (
                  <p className="flex flex-wrap items-center gap-1">
                    <strong className="md:w-40 w-28 text-white/60">Platform Revenue:</strong>
                    <span className="text-[rgb(255,240,120)] font-bold">₦{Number(transaction.platformRevenue).toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Failed Transaction Screenshot Section */}
        {status === 'Failed' && (
          <div className="bg-black rounded-lg shadow-md p-4 md:p-6 mb-6 border-l-4 border-red-500">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
              <FaImage /> Failed Transaction Screenshot
            </h4>

            {/* Existing Screenshot Display */}
            {existingScreenshot && !screenshotPreview && (
              <div className="mb-4">
                <p className="text-sm text-white/40 mb-2">Current Screenshot:</p>
                <div className="relative inline-block">
                  <img
                    src={existingScreenshot}
                    alt="Failed transaction"
                    className="max-w-full max-h-64 rounded-lg border border-white/10"
                  />
                </div>
              </div>
            )}

            {/* New Screenshot Preview */}
            {screenshotPreview && (
              <div className="mb-4">
                <p className="text-sm text-white/40 mb-2">New Screenshot:</p>
                <div className="relative inline-block">
                  <img
                    src={screenshotPreview}
                    alt="New screenshot preview"
                    className="max-w-full max-h-64 rounded-lg border border-white/10"
                  />
                  <button
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    title="Remove screenshot"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleScreenshotUpload}
                accept="image/*"
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity font-semibold"
              >
                <FaUpload />
                {existingScreenshot ? 'Replace Screenshot' : 'Upload Screenshot'}
              </label>
              {uploadingScreenshot && (
                <span className="text-[rgb(255,240,120)] flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[rgb(255,240,120)]"></div>
                  Uploading...
                </span>
              )}
              <p className="text-xs text-white/40">Max size: 5MB. Supported: JPG, PNG, GIF</p>
            </div>
          </div>
        )}

        {/* Update Section */}
        <div className="update-section flex flex-col items-start justify-center gap-4 bg-black p-4 md:p-6 rounded-lg shadow-md mb-6 border border-white/10">
          <h4 className="text-lg font-bold mb-2 text-[rgb(255,240,120)]">Update Transaction</h4>

          <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full'>
            <label className='font-bold md:w-32 w-full text-white/60'>Change Status:</label>
            <select
              value={status}
              className='h-10 w-full md:max-w-xs bg-white/10 text-white border border-white/20 rounded-md px-3 focus:outline-none focus:border-[rgb(255,240,120)]'
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending" className='bg-black text-white'>Pending</option>
              <option value="Completed" className='bg-black text-white'>Completed</option>
              <option value="Failed" className='bg-black text-white'>Failed</option>
            </select>
          </div>

          <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full'>
            <label className='font-bold md:w-32 w-full text-white/60'>Message:</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='h-10 w-full md:max-w-xs pl-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[rgb(255,240,120)]'
              placeholder="Enter message for user"
            />
          </div>

          <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full'>
            <label className='font-bold md:w-32 w-full text-white/60'>Exchange Rate:</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className='h-10 w-full md:max-w-xs pl-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[rgb(255,240,120)]'
              placeholder="Enter exchange rate (₦ per $)"
              step="0.01"
            />
          </div>

          {showRevenueInput && (
            <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full'>
              <label className='font-bold md:w-32 w-full text-white/60'>Platform Revenue:</label>
              <input
                type="number"
                value={platformRevenue}
                onChange={(e) => setPlatformRevenue(e.target.value)}
                className='h-10 w-full md:max-w-xs pl-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-[rgb(255,240,120)]'
                placeholder="Enter platform revenue (₦)"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 w-full mt-2">
            <button
              onClick={handleUpdate}
              disabled={loading || uploadingScreenshot}
              className='h-11 w-full md:w-48 bg-[rgb(255,240,120)] text-black hover:opacity-90 rounded-md font-semibold transition-opacity disabled:opacity-50'
            >
              {loading ? 'Updating...' : 'Update Transaction'}
            </button>

            <button
              onClick={() => navigate('/payment-panel')}
              className="h-11 w-full md:w-48 bg-white/10 hover:bg-white/20 text-white font-bold rounded-md border border-white/20 transition-colors"
            >
              Back to Admin Panel
            </button>
          </div>
        </div>

        <CustomPopup popup={popup} onClose={closePopup} />
      </div>
    </div>
  );
};

export default AdminTransactionDetails;