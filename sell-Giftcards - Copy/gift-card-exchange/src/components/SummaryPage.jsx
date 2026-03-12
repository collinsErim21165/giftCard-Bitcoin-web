import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebarpage } from './Sidebarpage';
import emailjs from 'emailjs-com';
import Compressor from 'compressorjs';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Great from '../assets/Great_smile.png';
import { auth } from '../firebaseConfig';
import { BsUpload, BsCashCoin, BsArrowLeft } from 'react-icons/bs';

const AlertModal = ({ show, handleClose, handleOK }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-5 md:ml-0 ml-6 rounded-md shadow-md md:w-[380px] w-[250px] h-52 flex flex-col items-center gap-3 justify-between">
        <h2 className="text-lg font-semibold mb-2">Transaction Sent</h2>
        <img src={Great} className="h-20 w-32" alt="Success Icon" />
        <div className="flex justify-end">
          <button onClick={handleClose} className="text-white px-4 bg-red-600 py-2 rounded-md mr-2">
            Close
          </button>
          <button onClick={handleOK} className="bg-black w-20 text-white px-4 py-2 rounded-md">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activePage, setActivePage] = useState('withdrawal');
  const [errorMessage, setErrorMessage] = useState(null);
  const [alert, setAlert] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // ========== DEBUGGING ==========
  useEffect(() => {
    console.log('📌 COMPONENT MOUNTED');
    console.log('📌 location.state:', location.state);

    if (location.state) {
      console.log('📌 State keys:', Object.keys(location.state));
      setDebugInfo(JSON.stringify(location.state, null, 2));
    } else {
      console.log('📌 NO STATE FOUND!');
      setDebugInfo('No state data received');
    }
  }, [location]);

  // Get data safely
  const stateData = location.state || {};
  const selectedGiftCard = stateData.selectedGiftCard || 'Not provided';
  const selectedCountry = stateData.selectedCountry || 'Not provided';
  const amount = stateData.amount || 0;
  const totalNaira = stateData.totalNaira || 0;
  const currencySymbol = stateData.currencySymbol || '$';
  const rate = stateData.rate || 0;

  // Format for display
  const displayAmount = typeof amount === 'number' ? amount.toLocaleString() : amount;
  const displayTotal = typeof totalNaira === 'number' ? totalNaira.toLocaleString() : totalNaira;
  const displayRate = typeof rate === 'number' ? rate.toLocaleString() : rate;

  const [cardCode, setCardCode] = useState('');
  const [cardFile, setCardFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const formRef = useRef();

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileUpload = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;

    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const compressFile = (file) =>
    new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.4,
        success: resolve,
        error: reject,
      });
    });

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (uploading) return;

    setErrorMessage(null);

    if (!cardFile || !receiptFile) {
      setErrorMessage('Please upload both card and receipt files before submitting.');
      return;
    }

    if (!cardCode.trim()) {
      setErrorMessage('Please enter your gift card code.');
      return;
    }

    setUploading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrorMessage('User not authenticated.');
        setUploading(false);
        return;
      }

      console.log('📌 Starting upload process...');
      
      // ---- CARD UPLOAD ----
      console.log('📌 Uploading card image...');
      const compressedCard = await compressFile(cardFile);
      const cardRef = ref(storage, `giftcards/${Date.now()}_${compressedCard.name}`);
      await uploadBytes(cardRef, compressedCard);
      const cardURL = await getDownloadURL(cardRef);
      console.log('📌 Card uploaded successfully');

      // ---- RECEIPT UPLOAD ----
      console.log('📌 Uploading receipt image...');
      const compressedReceipt = await compressFile(receiptFile);
      const receiptRef = ref(storage, `receipts/${Date.now()}_${compressedReceipt.name}`);
      await uploadBytes(receiptRef, compressedReceipt);
      const receiptURL = await getDownloadURL(receiptRef);
      console.log('📌 Receipt uploaded successfully');

      // ---- DATABASE - Save to BOTH collections ----
      console.log('📌 Saving to Firestore...');
      
      // Base data that both collections will use
      const baseData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userFullName: currentUser.displayName || '',
        giftCard: selectedGiftCard,
        country: selectedCountry,
        amount: Number(amount) || 0,
        totalNaira: Number(totalNaira) || 0,
        currency: currencySymbol,
        rate: Number(rate) || 0,
        cardCode: cardCode,
        cardImage: cardURL,
        receiptImage: receiptURL,
        status: 'Pending', // Capital P to match your transactions page
        message: 'Transaction is under review.',
        platformRevenue: 0,
        value: `${currencySymbol}${amount}`, // Add this for display in transactions page
      };

      console.log('📌 Base data:', baseData);

      // 1. Save to giftCardSubmissions (backup collection)
      const docRef = await addDoc(collection(db, 'giftCardSubmissions'), {
        ...baseData,
        createdAt: serverTimestamp()
      });
      console.log('📌 Saved to giftCardSubmissions with ID:', docRef.id);

      // 2. Save to transactionHistory (what your Transactions page reads)
      try {
        await addDoc(collection(db, 'transactionHistory'), {
          ...baseData,
          time: serverTimestamp(), // Use 'time' field for sorting
          type: 'giftcard',
          direction: 'sell',
          brand: selectedGiftCard,
        });
        console.log('📌 Saved to transactionHistory successfully');
      } catch (historyError) {
        console.error('📌 Error saving to transactionHistory:', historyError);
        // Don't throw - main save worked
      }

      // ---- EMAIL (try but don't fail if it doesn't work) ----
      try {
        console.log('📌 Sending email...');
        await emailjs.send(
          'service_qbrlml8',
          'template_kedax6h',
          {
            giftCard: selectedGiftCard,
            country: selectedCountry,
            value: `${currencySymbol}${amount}`,
            total: totalNaira?.toLocaleString() || '0',
            cardCode: cardCode,
            cardFileUrl: cardURL,
            receiptFileUrl: receiptURL,
            rate: rate ? `₦${displayRate}/${currencySymbol}` : 'N/A',
            userEmail: currentUser.email,
            userName: currentUser.displayName || 'Customer',
            transactionId: docRef.id
          },
          'gQQ0D9BjCs2RSVh8y'
        );
        console.log('📌 Email sent successfully');
      } catch (emailError) {
        console.error('📌 Email error (non-fatal):', emailError);
        // Don't throw - email is optional
      }

      console.log('📌 All steps completed successfully!');
      setAlert(true);
      
    } catch (error) {
      console.error('📌 ERROR in submission:', error);
      console.error('📌 Error message:', error.message);
      console.error('📌 Error code:', error.code);
      
      setErrorMessage(
        'Error: ' + (error.message || 'Failed to submit transaction. Please try again.')
      );
    } finally {
      setUploading(false);
    }
  };

  // Check if location state exists
  if (!location.state) {
    return (
      <div className="flex flex-row items-start md:h-full min-h-screen justify-start bg-[rgb(255,240,120)]">
        <div className={isCollapsed ? 'md:mr-24 mr-14' : 'md:mr-52 mr-0'}>
          <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} setActivePage={setActivePage} />
        </div>
        <div className="flex-1 p-6 md:pt-8 pt-32">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">No Transaction Data Found</h2>
            <p className="text-gray-600 mb-6">Please go back and select a gift card first.</p>
            <button 
              onClick={() => navigate('/submit-giftcard')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Go to Gift Card Selector
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-start md:h-full min-h-screen justify-start bg-[rgb(255,240,120)]">
      <div className={isCollapsed ? 'md:mr-24 mr-14' : 'md:mr-52 mr-0'}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} setActivePage={setActivePage} />
      </div>

      <div className="flex-1 md:-ml-0 -ml-10 p-4 md:p-8 pt-24 md:pt-8">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-black hover:text-blue-800 font-medium"
        >
          <BsArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* DEBUG PANEL */}
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">🔍 Transaction Summary</h3>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
            {debugInfo}
          </pre>
          <div className="mt-2 text-sm">
            <p><strong>Gift Card:</strong> {selectedGiftCard}</p>
            <p><strong>Country:</strong> {selectedCountry}</p>
            <p><strong>Amount:</strong> {currencySymbol}{displayAmount}</p>
            <p><strong>Total Naira:</strong> ₦{displayTotal}</p>
            <p><strong>Rate:</strong> ₦{displayRate}/{currencySymbol}</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Gift Card Summary</h2>

          {/* Summary Card */}
          <div className="bg-black rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-white mb-4">Gift Card Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-300">Gift Card Type</p>
                  <p className="text-lg font-semibold text-white">{selectedGiftCard}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-300">Country</p>
                  <p className="text-lg font-semibold text-white">{selectedCountry}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-300">Card Value</p>
                  <p className="text-lg font-semibold text-blue-600">{currencySymbol}{displayAmount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Exchange Rate</p>
                      <p className="text-xl font-bold text-blue-800">
                        ₦{displayRate}
                        <span className="text-base font-medium text-gray-600">/{currencySymbol}</span>
                      </p>
                    </div>
                    <BsCashCoin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-700">Total Payout</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₦{displayTotal}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {displayAmount} {currencySymbol} × ₦{displayRate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-black rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-white mb-6">Upload Required Documents</h3>

            <form ref={formRef} onSubmit={handleSendEmail}>
              {/* Card Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Gift Card Code
                </label>
                <input
                  type="text"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your gift card code"
                  required
                />
              </div>

              {/* Card Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Upload Gift Card Image
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setCardFile, setCardPreview)}
                  className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 hover:border-gray-400 cursor-pointer"
                  accept="image/*"
                  required
                />
              </div>

              {/* Receipt Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  Upload Receipt Image
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setReceiptFile, setReceiptPreview)}
                  className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 hover:border-gray-400 cursor-pointer"
                  accept="image/*"
                  required
                />
              </div>

              {/* Image Previews */}
              {(cardPreview || receiptPreview) && (
                <div className="mb-8 p-4 bg-gray-100 rounded-xl border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
                  <div className="flex flex-wrap gap-4">
                    {cardPreview && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Card Image</p>
                        <img src={cardPreview} className="h-32 w-48 rounded-lg object-cover border border-gray-300" alt="Card preview" />
                      </div>
                    )}
                    {receiptPreview && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Receipt Image</p>
                        <img src={receiptPreview} className="h-32 w-48 rounded-lg object-cover border border-gray-300" alt="Receipt preview" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={uploading || !cardFile || !receiptFile || !cardCode.trim()}
                  className="
                    w-full md:w-auto
                    px-8 py-4
                    bg-white text-black
                    rounded-xl
                    font-bold
                    text-lg
                    hover:bg-gray-400
                    active:scale-[0.98]
                    transition-all duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex items-center justify-center gap-3
                    min-w-[200px]
                  "
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <BsUpload className="w-5 h-5" />
                      Submit Transaction
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Upload Requirements */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-xs text-yellow-700 list-disc md:pl-4 pl-0 space-y-1">
                <li>Make sure both images are clear and readable</li>
                <li>Card code must match the uploaded gift card</li>
                <li>Receipt must show purchase details</li>
                <li>Do not close this page until submission is complete</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertModal
          show={alert}
          handleClose={() => setAlert(false)}
          handleOK={() => navigate('/transactions')}
        />
      </div>
    </div>
  );
};

export default SummaryPage;