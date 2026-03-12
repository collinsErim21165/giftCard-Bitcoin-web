// AdminWithdrawals.js - COMPLETE WORKING VERSION
import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebaseConfig';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  FaUpload,
  FaImage,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaExchangeAlt,
  FaBuilding,
  FaIdCard,
  FaFileInvoice,
  FaPhone
} from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';
import { AiOutlineBank } from 'react-icons/ai';
import { Sidebarpage } from './Sidebarpage';
import { useNavigate } from 'react-router-dom';

const AdminWithdrawals = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingAmount: 0,
    processingAmount: 0,
    completedToday: 0,
    totalDocuments: 0
  });
  const [error, setError] = useState('');
  const [popup, setPopup] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showInput: false,
    showImageUpload: false,
    inputValue: '',
    inputPlaceholder: '',
    withdrawalId: null,
    withdrawalData: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileRef = useRef(null); // Persists file across renders for callbacks
  const fileInputRef = useRef(null); // Reference to the DOM input element

  // Show popup function
  const showPopup = (type, title, message, onConfirm = null, onCancel = null, options = {}) => {
    setPopup({
      show: true,
      type,
      title,
      message,
      onConfirm,
      onCancel,
      showInput: options.showInput || false,
      showImageUpload: options.showImageUpload || false,
      inputValue: options.inputValue || '',
      inputPlaceholder: options.inputPlaceholder || '',
      withdrawalId: options.withdrawalId || null,
      withdrawalData: options.withdrawalData || null
    });
  };

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close popup
  const closePopup = () => {
    setPopup({
      show: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      showInput: false,
      showImageUpload: false,
      inputValue: '',
      inputPlaceholder: '',
      withdrawalId: null,
      withdrawalData: null
    });
    setImageFile(null);
    setImagePreview(null);
    imageFileRef.current = null;
  };

  // Handle input change in popup
  const handlePopupInputChange = (e) => {
    setPopup(prev => ({
      ...prev,
      inputValue: e.target.value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showPopup('error', 'Invalid File', 'Please upload an image file (JPG, PNG, etc.)', closePopup);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showPopup('error', 'File Too Large', 'Please upload an image smaller than 5MB', closePopup);
        return;
      }

      setImageFile(file);
      imageFileRef.current = file;
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (withdrawalId, fileToUpload) => {
    if (!fileToUpload) return null;

    try {
      setUploadingImage(true);

      const timestamp = Date.now();
      const fileName = `receipts/${withdrawalId}_${timestamp}_${fileToUpload.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      setUploadingImage(false);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadingImage(false);
      showPopup('error', 'Upload Failed', 'Failed to upload image: ' + error.message, closePopup);
      return null;
    }
  };

  useEffect(() => {
    console.log("🔄 AdminWithdrawals component mounted");
    fetchWithdrawals();

    // Removed auto-refresh - admins can manually refresh when needed

    return () => {
      console.log("🧹 Cleaning up AdminWithdrawals");
    };
  }, []);

  // Helper function to get bank details from withdrawal
  const getBankDetails = (withdrawal) => {
    if (withdrawal.bankDetails) {
      return {
        name: withdrawal.bankDetails.name || 'Unknown Bank',
        accountNumber: withdrawal.bankDetails.accountNumber || 'N/A',
        accountName: withdrawal.bankDetails.accountName || 'N/A',
        logo: withdrawal.bankDetails.logo,
        bankCode: withdrawal.bankDetails.bankCode
      };
    }

    return {
      name: 'Unknown Bank',
      accountNumber: 'N/A',
      accountName: 'N/A',
      logo: null,
      bankCode: null
    };
  };

  // Helper to get user info
  const getUserInfo = (withdrawal) => {
    return {
      name: withdrawal.userName || 'Unknown User',
      email: withdrawal.userEmail || 'No email',
      phone: withdrawal.userPhone || 'No phone',
      id: withdrawal.userId || 'No ID'
    };
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');

      console.log("🔄 Fetching withdrawals...");

      // Get ALL documents first
      const allQuery = query(collection(db, "withdrawals"), orderBy("date", "desc"));
      const allSnapshot = await getDocs(allQuery);

      console.log(`📊 Found ${allSnapshot.size} total documents`);

      if (allSnapshot.size === 0) {
        setWithdrawals([]);
        setStats({
          pendingAmount: 0,
          processingAmount: 0,
          completedToday: 0,
          totalDocuments: 0
        });
        setLoading(false);
        return;
      }

      let data = [];
      // Calculate stats manually from the full list to avoid index issues and ensure accuracy
      let pendingAmount = 0;
      let processingAmount = 0;
      let completedToday = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      allSnapshot.forEach(doc => {
        const docData = doc.data();
        const status = (docData.status || '').toLowerCase();
        const amount = Number(docData.amount || 0);

        if (status === 'pending') {
          pendingAmount += amount;

          const withdrawal = {
            ...docData,
            id: doc.id,
            bankInfo: getBankDetails(docData),
            userInfo: getUserInfo(docData)
          };
          data.push(withdrawal);
        }
        else if (status === 'processing') {
          processingAmount += amount;

          const withdrawal = {
            ...docData,
            id: doc.id,
            bankInfo: getBankDetails(docData),
            userInfo: getUserInfo(docData)
          };
          data.push(withdrawal);
        }
        else if (status === 'completed') {
          // Check if completed today
          if (docData.completedAt) {
            const completedDate = new Date(docData.completedAt);
            completedDate.setHours(0, 0, 0, 0);
            if (completedDate.getTime() === today.getTime()) {
              completedToday += amount;
            }
          }
        }
      });

      setWithdrawals(data);
      setStats({
        pendingAmount,
        processingAmount,
        completedToday,
        totalDocuments: allSnapshot.size
      });

    } catch (error) {
      console.error("❌ Error fetching withdrawals:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Show transfer details popup
  const showTransferPopup = (withdrawal) => {
    const bankInfo = withdrawal.bankInfo || getBankDetails(withdrawal);
    const userInfo = withdrawal.userInfo || getUserInfo(withdrawal);

    showPopup('info', '💸 Send Money Manually',
      `Amount: ₦${withdrawal.amount.toLocaleString()}
Bank: ${bankInfo.name || 'Unknown Bank'}
Account: ${bankInfo.accountNumber || 'N/A'}
Name: ${bankInfo.accountName || 'N/A'}
User: ${userInfo.name || 'Unknown User'}
Email: ${userInfo.email || 'N/A'}

⚠️ INSTRUCTIONS:
1. Open YOUR business bank app
2. Send ₦${withdrawal.amount.toLocaleString()} to the account above
3. Get the transaction reference
4. Take a screenshot of the successful transfer
5. Click "Confirm" to mark as processing`,
      async () => {
        // Close popup immediately
        closePopup();

        // Show loading popup
        showPopup('info', 'Processing...', 'Checking withdrawal status...', null, null);

        try {
          console.log("🔄 Checking withdrawal with ID:", withdrawal.id);

          // First, check if the document exists
          const withdrawalRef = doc(db, "withdrawals", withdrawal.id);
          const withdrawalDoc = await getDoc(withdrawalRef);

          if (!withdrawalDoc.exists()) {
            console.error("❌ Document does not exist:", withdrawal.id);
            // Close loading popup
            closePopup();

            // Refresh and show error
            setTimeout(async () => {
              await fetchWithdrawals();
              showPopup('error', 'Withdrawal Not Found',
                `The withdrawal with ID "${withdrawal.id}" was not found.\n\nIt may have been:\n• Processed by another admin\n• Deleted\n• Already completed\n\nThe list has been refreshed.`,
                closePopup
              );
            }, 300);
            return;
          }

          const docData = withdrawalDoc.data();

          // Check if withdrawal is still pending
          if (docData.status !== 'pending') {
            console.log(`⚠️ Withdrawal is already ${docData.status}`);
            // Close loading popup
            closePopup();

            setTimeout(async () => {
              await fetchWithdrawals();
              showPopup('warning', 'Already Processed',
                `This withdrawal is already marked as "${docData.status}".\n\nThe list has been refreshed.`,
                closePopup
              );
            }, 300);
            return;
          }

          console.log("✅ Document exists and is pending, updating...");

          // Update the document
          await updateDoc(withdrawalRef, {
            status: 'processing',
            startedAt: new Date().toISOString(),
            processedBy: 'Admin',
            processingNote: 'Started processing - waiting for bank transfer'
          });

          console.log("✅ Update successful for withdrawal:", withdrawal.id);

          // Close loading popup
          closePopup();

          // Show success and refresh
          setTimeout(async () => {
            await fetchWithdrawals();
            showPopup('success', 'Processing Started',
              '✅ Status updated to "processing".\n\n📋 Now send the money via your bank app using the details above.\n\n💰 After sending, click "Mark as Sent" to complete the process.',
              closePopup
            );
          }, 300);

        } catch (error) {
          console.error("❌ Update error:", error);
          // Close loading popup
          closePopup();

          setTimeout(async () => {
            await fetchWithdrawals();
            showPopup('error', 'Update Failed',
              `Could not update withdrawal.\n\nError: ${error.message}\n\nList has been refreshed.`,
              closePopup
            );
          }, 300);
        }
      },
      closePopup
    );
  };

  const startProcessing = async (withdrawal) => {
    showTransferPopup(withdrawal);
  };

  // Show mark as sent with image upload - FIXED with useRef
  const showMarkAsSentPopup = (withdrawalId) => {
    showPopup('info', 'Mark as Sent & Upload Receipt',
      'Upload bank receipt screenshot to complete this withdrawal:',
      async () => {
        // Capture the file from REF before closing popup (which clears state/ref)
        const fileToUpload = imageFileRef.current;
        console.log("📸 Image file captured from ref:", fileToUpload);

        closePopup();

        // Show loading popup
        showPopup('info', 'Processing...', 'Completing withdrawal...', null, null);

        try {
          const withdrawalRef = doc(db, "withdrawals", withdrawalId);
          const withdrawalDoc = await getDoc(withdrawalRef);

          if (!withdrawalDoc.exists()) {
            closePopup();
            setTimeout(async () => {
              await fetchWithdrawals();
              showPopup('error', 'Not Found', 'Withdrawal no longer exists. List refreshed.', closePopup);
            }, 100);
            return;
          }

          let receiptImageUrl = null;

          if (fileToUpload) {
            receiptImageUrl = await uploadImage(withdrawalId, fileToUpload);
            if (!receiptImageUrl) {
              closePopup();
              return;
            }
          }

          const updateData = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: 'Admin'
          };

          if (receiptImageUrl) {
            updateData.receiptImage = receiptImageUrl;
            updateData.note = 'Sent manually via bank transfer (receipt uploaded)';
          } else {
            updateData.note = 'Sent manually via bank transfer (no receipt)';
          }

          await updateDoc(withdrawalRef, updateData);

          // Update user's transaction history
          const withdrawalData = withdrawalDoc.data();
          try {
            const userRef = doc(db, "users", withdrawalData.userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const transactions = userData.transactions || [];

              // Fixed: Match by withdrawal ID if available, otherwise use stricter criteria
              const updatedTransactions = transactions.map(t => {
                // First try to match by withdrawal ID (if stored)
                if (t.withdrawalId && t.withdrawalId === withdrawalId) {
                  console.log("✅ Matched by withdrawalId:", withdrawalId, "Receipt:", receiptImageUrl);
                  return {
                    ...t,
                    status: 'completed',
                    receiptImage: receiptImageUrl,
                    completedAt: new Date().toISOString(),
                    // Add bank details as object for TransactionHistory display
                    bank: withdrawalData.bankDetails || t.bank
                  };
                }
                // Fallback: Match by date, amount, AND status to prevent wrong updates
                else if (t.date === withdrawalData.date &&
                  t.amount === withdrawalData.amount &&
                  t.status === 'pending' &&
                  t.type === 'withdrawal') {
                  console.log("✅ Matched by date/amount:", t.date, t.amount, "Receipt:", receiptImageUrl);
                  return {
                    ...t,
                    status: 'completed',
                    receiptImage: receiptImageUrl,
                    completedAt: new Date().toISOString(),
                    // Add bank details as object for TransactionHistory display
                    bank: withdrawalData.bankDetails || t.bank
                  };
                }
                return t;
              });

              await updateDoc(userRef, {
                transactions: updatedTransactions
              });
            }
          } catch (userError) {
            console.warn("Could not update user transactions:", userError);
          }

          closePopup();
          setTimeout(async () => {
            await fetchWithdrawals();
            showPopup('success', 'Money Sent!',
              receiptImageUrl
                ? `✅ Transaction completed!\n\n Receipt uploaded successfully.`
                : `✅ Transaction completed!\n\n⚠️ No receipt uploaded.`,
              closePopup
            );
          }, 500);
        } catch (error) {
          console.error("Error:", error);
          closePopup();
          setTimeout(() => {
            showPopup('error', 'Error', 'Failed to update withdrawal: ' + error.message, closePopup);
          }, 100);
        }
      },
      closePopup,
      {
        showInput: false,
        showImageUpload: true,
        withdrawalId: withdrawalId
      }
    );
  };

  const markAsSent = async (withdrawalId) => {
    showMarkAsSentPopup(withdrawalId);
  };

  const rejectWithdrawal = async (withdrawalId) => {
    showPopup('info', 'Reason for Rejection',
      'Please enter the reason for rejecting this withdrawal:',
      async () => {
        if (!popup.inputValue) {
          closePopup();
          setTimeout(() => {
            showPopup('warning', 'Reason Required', 'Please provide a reason for rejection.', closePopup);
          }, 100);
          return;
        }

        const rejectionReason = popup.inputValue;
        closePopup();

        // Show loading popup
        showPopup('info', 'Processing...', 'Rejecting withdrawal...', null, null);

        try {
          const withdrawalRef = doc(db, "withdrawals", withdrawalId);
          const withdrawalDoc = await getDoc(withdrawalRef);

          if (!withdrawalDoc.exists()) {
            closePopup();
            setTimeout(async () => {
              await fetchWithdrawals();
              showPopup('error', 'Not Found', 'Withdrawal no longer exists. List refreshed.', closePopup);
            }, 100);
            return;
          }

          const withdrawalData = withdrawalDoc.data();

          // REFUND BALANCE TO USER
          if (withdrawalData.userId) {
            const userRef = doc(db, "users", withdrawalData.userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              const newBalance = (userData.balance || 0) + withdrawalData.amount;

              await updateDoc(userRef, {
                balance: newBalance
              });
            }
          }

          await updateDoc(withdrawalRef, {
            status: 'rejected',
            reason: rejectionReason,
            rejectedAt: new Date().toISOString()
          });

          closePopup();
          setTimeout(async () => {
            await fetchWithdrawals();
            showPopup('success', 'Withdrawal Rejected', '✅ Withdrawal rejected.\n\n💰 Balance has been refunded to the user.', closePopup);
          }, 500);
        } catch (error) {
          console.error("Error:", error);
          closePopup();
          setTimeout(() => {
            showPopup('error', 'Error', 'Failed to reject withdrawal: ' + error.message, closePopup);
          }, 100);
        }
      },
      closePopup,
      {
        showInput: true,
        inputPlaceholder: 'e.g., Insufficient funds, invalid account'
      }
    );
  };

  // Popup Component
  const Popup = () => {
    if (!popup.show) return null;

    const bgColor = {
      info: 'bg-[rgb(18,18,18)] border-blue-500/30',
      success: 'bg-[rgb(18,18,18)] border-green-500/30',
      warning: 'bg-[rgb(18,18,18)] border-yellow-500/30',
      error: 'bg-[rgb(18,18,18)] border-red-500/30'
    }[popup.type] || 'bg-[rgb(18,18,18)] border-blue-500/30';

    const textColor = {
      info: 'text-white',
      success: 'text-white',
      warning: 'text-white',
      error: 'text-white'
    }[popup.type] || 'text-white';

    const buttonColor = {
      info: 'bg-[rgb(255,240,120)] text-black hover:opacity-90',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      warning: 'bg-[rgb(255,240,120)] text-black hover:opacity-90',
      error: 'bg-red-600 hover:bg-red-700 text-white'
    }[popup.type] || 'bg-[rgb(255,240,120)] text-black hover:opacity-90';

    const IconComponent = {
      info: FaMoneyBillWave,
      success: FaCheckCircle,
      warning: FaClock,
      error: FaTimes
    }[popup.type] || FaMoneyBillWave;

    const iconColor = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    }[popup.type] || 'text-blue-600';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className={`${bgColor} border-2 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <IconComponent className={`text-2xl ${iconColor}`} />
                <div className="flex-1">
                  <h3 className={`font-bold text-xl mb-2 ${textColor}`}>{popup.title}</h3>
                  <div className="whitespace-pre-line text-white/80">
                    {popup.message}
                  </div>

                  {popup.showInput && (
                    <div className="mt-4">
                      <input
                        type="text"
                        value={popup.inputValue}
                        onChange={handlePopupInputChange}
                        placeholder={popup.inputPlaceholder}
                        className="w-full px-4 py-3 bg-black border border-white/20 text-white rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] placeholder:text-white/30"
                        autoFocus
                      />
                    </div>
                  )}

                  {popup.showImageUpload && (
                    <div className="mt-4 space-y-3">
                      <label className="block text-sm font-medium text-white/70">
                        Upload Bank Receipt Screenshot
                      </label>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center px-4 py-2 bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)] rounded-lg hover:bg-[rgb(255,240,120)]/20 transition-colors"
                        >
                          <FaUpload className="mr-2" />
                          Choose File
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {imageFile && (
                          <span className="text-sm text-white/60">
                            {imageFile.name}
                          </span>
                        )}
                      </div>

                      {imagePreview && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-white/70 mb-2">Preview:</p>
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Receipt preview"
                              className="w-full h-48 object-contain border border-white/10 rounded-lg"
                            />
                            <button
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FaTimes size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-white/40 mt-2">
                        📸 Take a screenshot of your successful bank transfer and upload it here
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={closePopup}
                className="text-white/50 hover:text-white text-2xl ml-2"
              >
                ×
              </button>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              {popup.onCancel && (
                <button
                  onClick={popup.onCancel}
                  className="px-5 py-2.5 border border-white/20 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              )}
              {popup.onConfirm && (
                <button
                  onClick={popup.onConfirm}
                  disabled={uploadingImage}
                  className={`px-5 py-2.5 rounded-lg transition-colors flex items-center ${buttonColor} ${uploadingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              )}
              {!popup.onConfirm && !popup.onCancel && (
                <button
                  onClick={closePopup}
                  className="px-5 py-2.5 bg-[rgb(255,240,120)] text-black rounded-lg hover:opacity-90 transition-colors"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(255,240,120)] p-6">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-black/20 border-t-black"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaMoneyBillWave className="text-2xl text-black" />
            </div>
          </div>
          <p className="mt-6 text-black text-lg font-medium">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-[rgb(255,240,120)] min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <div className={`fixed md:relative z-40 ${isCollapsed ? 'w-20 md:mr-0' : 'w-52 md:mr-24'} md:w-auto`}>
        <Sidebarpage
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-screen md:ml-20 md:mt-0 mt-20 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
              💸 Admin Withdrawals Dashboard
            </h1>
            <p className="text-black/70">Process and manage user withdrawal requests</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-5 bg-red-900/20 border border-red-500/30 rounded-xl">
              <div className="flex items-start">
                <FaTimes className="text-red-400 text-xl mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-bold text-lg">Error:</p>
                  <p className="text-red-400/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-black p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[rgb(255,240,120)]/70">Pending to Send</p>
                  <p className="text-3xl font-bold text-[rgb(255,240,120)] mt-2">₦{stats.pendingAmount.toLocaleString()}</p>
                  <p className="text-xs text-[rgb(255,240,120)]/60 mt-2 flex items-center">
                    <FaClock className="mr-1.5" /> Awaiting processing
                  </p>
                </div>
                <div className="p-3 bg-[rgb(255,240,120)]/10 rounded-xl">
                  <FaClock className="text-2xl text-[rgb(255,240,120)]" />
                </div>
              </div>
            </div>

            <div className="bg-black p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-400/70">In Progress</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">₦{stats.processingAmount.toLocaleString()}</p>
                  <p className="text-xs text-blue-400/60 mt-2 flex items-center">
                    <MdPayment className="mr-1.5" /> Being processed
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <MdPayment className="text-2xl text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-black p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-400/70">Sent Today</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">₦{stats.completedToday.toLocaleString()}</p>
                  <p className="text-xs text-green-400/60 mt-2 flex items-center">
                    <FaCheckCircle className="mr-1.5" /> Completed today
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <FaCheckCircle className="text-2xl text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-black p-6 rounded-2xl border border-white/10 hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/50">Total Requests</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalDocuments}</p>
                  <p className="text-xs text-white/40 mt-2">All withdrawals</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <AiOutlineBank className="text-2xl text-white/70" />
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawals List */}
          {withdrawals.length === 0 ? (
            <div className="text-center p-12 bg-black border border-white/10 rounded-2xl">
              <div className="text-white/20 mb-6">
                <FaMoneyBillWave className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-semibold text-white/70 mb-3">No Pending Withdrawals</h3>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {stats.totalDocuments === 0
                  ? "No withdrawal requests have been created yet."
                  : "All withdrawals have been processed."}
              </p>
              <button
                onClick={fetchWithdrawals}
                className="px-6 py-3 bg-[rgb(255,240,120)] text-black rounded-xl hover:opacity-90 transition-all"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-black">
                  Pending Withdrawals ({withdrawals.length})
                </h3>
                <button
                  onClick={fetchWithdrawals}
                  className="text-sm px-4 py-2 bg-black/20 text-black rounded-lg hover:bg-black/30 transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {withdrawals.map((withdrawal) => {
                  const bankInfo = withdrawal.bankInfo || getBankDetails(withdrawal);
                  const userInfo = withdrawal.userInfo || getUserInfo(withdrawal);

                  return (
                    <div key={withdrawal.id} className="bg-black border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className={`p-4 rounded-xl ${withdrawal.status === 'pending' ? 'bg-[rgb(255,240,120)]/10' : 'bg-blue-500/10'
                            }`}>
                            <span className="font-bold text-2xl text-white">₦{withdrawal.amount?.toLocaleString()}</span>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                            }`}>
                            {withdrawal.status?.toUpperCase()}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                              <FaUser className="text-white/60" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-white">{userInfo.name}</h4>
                              <div className="flex items-center text-white/60 text-sm mt-1">
                                <FaEnvelope className="mr-1.5" />
                                {userInfo.email}
                              </div>
                              {userInfo.phone && userInfo.phone !== 'No phone' && (
                                <div className="flex items-center text-white/60 text-sm mt-1">
                                  <FaPhone className="mr-1.5" />
                                  {userInfo.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-white/50 bg-white/5 p-2 rounded-lg">
                            <FaIdCard className="inline mr-1.5" />
                            ID: {userInfo.id.substring(0, 16)}...
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="mb-6 space-y-4">
                          <div className="flex items-center">
                            <FaBuilding className="text-white/50 mr-3" />
                            <div>
                              <p className="font-medium text-white/90">{bankInfo.name}</p>
                              <p className="text-sm text-white/60">
                                Account: {bankInfo.accountNumber}
                              </p>
                              <p className="text-sm text-white/60">
                                Name: {bankInfo.accountName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaCalendarAlt className="text-white/50 mr-3" />
                            <div>
                              <p className="text-sm text-white/60">Requested:</p>
                              <p className="font-medium text-white/90">
                                {new Date(withdrawal.date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-6 border-t border-white/10">
                          {withdrawal.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => startProcessing(withdrawal)}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center justify-center font-bold"
                              >
                                <FaExchangeAlt className="mr-2" /> Start Processing
                              </button>
                              <button
                                onClick={() => rejectWithdrawal(withdrawal.id)}
                                className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md flex items-center justify-center"
                              >
                                <FaTimes className="mr-2" /> Reject
                              </button>
                            </div>
                          )}

                          {withdrawal.status === 'processing' && (
                            <button
                              onClick={() => markAsSent(withdrawal.id)}
                              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center font-bold"
                            >
                              <FaImage className="mr-2" /> Mark as Sent
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 p-7 bg-black border border-white/10 rounded-2xl">
            <h4 className="font-bold text-xl text-[rgb(255,240,120)] mb-5 flex items-center">
              <FaFileInvoice className="mr-2" /> How to Process Withdrawals
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="bg-[rgb(255,240,120)] text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
                <span className="text-white/70">Click <strong className="text-white">"Start Processing"</strong> on a pending withdrawal request</span>
              </div>
              <div className="flex items-start">
                <span className="bg-[rgb(255,240,120)] text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
                <span className="text-white/70">Open your business bank app and <strong className="text-white">send the money</strong> to the user's account</span>
              </div>
              <div className="flex items-start">
                <span className="bg-[rgb(255,240,120)] text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
                <span className="text-white/70">Take a <strong className="text-white">screenshot</strong> of the successful bank transfer</span>
              </div>
              <div className="flex items-start">
                <span className="bg-[rgb(255,240,120)] text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
                <span className="text-white/70">Click <strong className="text-white">"Mark as Sent"</strong>, enter the transaction reference, and upload the receipt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popup Component */}
        <Popup />
      </div>
    </div>
  );
};

export default AdminWithdrawals;