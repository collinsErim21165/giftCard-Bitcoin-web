import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, getDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { Sidebarpage } from './Sidebarpage';
import usePopup from './usePopup';
import CustomPopup from './CustomPopup';
import TransactionPin from './TransactionPin'; // Import the PIN popup
import OPayLogo from '../assets/opay.svg';
import MoniepointLogo from '../assets/Moniepoint.svg';
import KudaLogo from '../assets/Kuda.svg';
import PalmPayLogo from '../assets/palmpay.png';

const Withdraw = () => {
  const [userBanks, setUserBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [balance, setBalance] = useState(0.00);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isPinPopupOpen, setIsPinPopupOpen] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  const { popup, showPopup, closePopup } = usePopup();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setBalance(data.balance || 0);

          // Refresh bank logos for brand accuracy
          const updatedBanks = (data.banks || []).map(bank => {
            if (bank.name === 'OPay') return { ...bank, logo: OPayLogo };
            if (bank.name === 'Moniepoint') return { ...bank, logo: MoniepointLogo };
            if (bank.name === 'Kuda Bank') return { ...bank, logo: KudaLogo };
            if (bank.name === 'PalmPay') return { ...bank, logo: PalmPayLogo };
            return bank;
          });

          // Add unique IDs for each bank to prevent selection issues
          const banksWithIds = updatedBanks.map((bank, index) => ({
            ...bank,
            uniqueId: `${bank.name}-${bank.accountNumber || ''}-${index}`
          }));

          setUserBanks(banksWithIds);

          // Update Firestore if we refreshed any logos
          const needsUpdate = (data.banks || []).some(b => {
            if (b.name === 'OPay' && b.logo !== OPayLogo) return true;
            if (b.name === 'Moniepoint' && b.logo !== MoniepointLogo) return true;
            if (b.name === 'Kuda Bank' && b.logo !== KudaLogo) return true;
            if (b.name === 'PalmPay' && b.logo !== PalmPayLogo) return true;
            return false;
          });

          if (needsUpdate) {
            updateDoc(userDocRef, { banks: updatedBanks });
          }
        }
      }
    };

    fetchUserData();
  }, []);

  // Handle withdraw button click - opens PIN popup first
  const handleWithdrawClick = () => {
    // Validate inputs first
    if (!selectedBank || !withdrawAmount) {
      showPopup('warning', 'Missing Details', 'Please select a bank account and enter amount', closePopup);
      return;
    }

    const amount = parseFloat(withdrawAmount);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      showPopup('warning', 'Invalid Amount', 'Please enter a valid amount', closePopup);
      return;
    }

    if (amount < 1000) {
      showPopup('warning', 'Minimum Withdrawal', 'Minimum withdrawal amount is ₦1,000', closePopup);
      return;
    }

    if (amount > balance) {
      showPopup('error', 'Insufficient Funds', `Insufficient balance! You have ₦${balance.toLocaleString()} available`, closePopup);
      return;
    }

    // Check if user has transaction PIN set
    if (!userData?.transactionPin) {
      showPopup('warning', 'PIN Required', 'Please set a transaction PIN first in your dashboard', closePopup);
      return;
    }

    // Store withdrawal details and open PIN popup
    setPendingWithdrawal({
      amount,
      bank: selectedBank
    });
    setIsPinPopupOpen(true);
  };

  // Handle PIN popup close
  const handlePinClose = () => {
    setIsPinPopupOpen(false);
    setPendingWithdrawal(null);
  };

  // Handle successful PIN verification
  const handlePinSuccess = async () => {
    setIsPinPopupOpen(false);

    if (!pendingWithdrawal) return;

    const { amount, bank } = pendingWithdrawal;

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);

      // Generate unique transaction ID
      const transactionId = `WDR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 1. DEDUCT BALANCE IMMEDIATELY
      const newBalance = balance - amount;

      // 2. Create withdrawal record
      const withdrawalData = {
        id: transactionId,
        userId: user.uid,
        userName: userData?.fullName || user.email,
        userEmail: user.email,
        userPhone: userData?.phone || '',
        amount: amount,
        bankDetails: {
          name: bank.name,
          accountNumber: bank.accountNumber,
          accountName: bank.accountName,
          bankCode: bank.bankCode || '',
          logo: bank.logo || ''
        },
        status: 'pending',
        date: new Date().toISOString(),
        createdAt: new Date(),
        previousBalance: balance,
        newBalance: newBalance,
        transactionId: transactionId,
        pinVerified: true // Add verification flag
      };

      // 3. Create user transaction record
      const userTransaction = {
        id: transactionId,
        type: 'withdrawal',
        amount: amount,
        bank: bank.name,
        accountNumber: bank.accountNumber,
        accountName: bank.accountName,
        date: new Date().toISOString(),
        status: 'pending',
        transactionId: transactionId,
        timestamp: new Date(),
        pinVerified: true
      };

      // 4. Perform all updates in a batch
      // Save to withdrawals collection
      await addDoc(collection(db, "withdrawals"), withdrawalData);

      // Update user balance
      await updateDoc(userDocRef, {
        balance: newBalance,
        transactions: arrayUnion(userTransaction)
      });

      // 5. Show success message
      showPopup('success', 'Withdrawal Submitted', `✅ Withdrawal Request Submitted!

Amount: ₦${amount.toLocaleString()}
To: ${bank.name} - ${bank.accountNumber}
Transaction ID: ${transactionId}

📋 IMPORTANT:
* Your balance has been updated to ₦${newBalance.toLocaleString()}
* We will process your withdrawal within 24 hours
* You will receive the money in your bank account
* Keep this transaction ID for reference

Thank you for your patience!`, closePopup);

      // Reset form and update balance
      setBalance(newBalance);
      setWithdrawAmount('');
      setSelectedBank(null);
      setPendingWithdrawal(null);

    } catch (error) {
      console.error('Withdrawal error:', error);

      // Show user-friendly error messages
      if (error.code === 'permission-denied') {
        showPopup('error', 'Permission Denied', '❌ Permission denied. Please contact support.', closePopup);
      } else if (error.code === 'unavailable') {
        showPopup('error', 'Network Error', '❌ Network error. Please check your connection and try again.', closePopup);
      } else {
        showPopup('error', 'Withdrawal Failed', '❌ Error processing withdrawal: ' + error.message, closePopup);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleMaxWithdraw = () => {
    setWithdrawAmount(balance.toString());
  };

  return (
    <div className='flex flex-col md:flex-row items-start bg-[rgb(255,240,120)] w-full min-h-screen'>
      <div className={isCollapsed ? 'md:mr-16' : 'md:mr-44'}>
        <Sidebarpage
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>

      <div className='flex flex-col md:pr-0 pr-3 md:pt-0 pt-24 md:p-10'>
        <CustomPopup popup={popup} onClose={closePopup} />

        {/* PIN Verification Popup - Now with all required props */}
        <TransactionPin
          isOpen={isPinPopupOpen}
          onClose={handlePinClose}
          onSuccess={handlePinSuccess}
          amount={pendingWithdrawal?.amount}
          bankName={pendingWithdrawal?.bank?.name}
          mode="verify"
        />

        <h2 className='text-3xl font-bold mb-2 mt-2'>Withdraw Funds</h2>

        {/* Balance Display */}
        <div className='mb-6 p-4 bg-black rounded-lg shadow-sm '>
          <p className='text-lg text-[rgb(255,240,120)]'>
            Available Balance: <span className='font-bold text-2xl text-green-600'>₦{balance.toLocaleString()}</span>
          </p>
          <p className='text-sm text-gray-200 mt-1'>
            Minimum withdrawal: ₦1,000 • Processing time: <span className='text-red-500'>Few Minutes</span>
          </p>
        </div>

        {/* Bank Selection */}
        <div className='mb-8'>
          <h3 className='font-bold mb-4 text-lg'>Select Bank Account</h3>

          {userBanks.length === 0 ? (
            <div className='p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center'>
              <p className='text-yellow-700 font-semibold'>No bank accounts added</p>
              <p className='text-sm text-yellow-600 mt-1'>
                Please add a bank account in your profile settings first.
              </p>
            </div>
          ) : (
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'>
              {userBanks.map((bank, index) => {
                const isSelected = selectedBank?.uniqueId === bank.uniqueId;

                return (
                  <div
                    key={bank.uniqueId || index}
                    onClick={() => {
                      setSelectedBank(bank);
                    }}
                    className={`flex items-center bg-black gap-4 cursor-pointer  p-4 rounded-lg transition-all duration-200
                      ${isSelected
                        ? 'border-green-500 bg-black ring-2 ring-green-500 border-2'
                        : 'group border-gray-300 hover:border-gray-400 hover:bg-white hover:text-black'}`}
                  >
                    <div className='flex-shrink-0'>
                      {bank.logo ? (
                        <div className='w-14 h-14 flex items-center bg-[rgb(255,240,120)] rounded pl-2 justify-center overflow-hidden'>
                          <img
                            src={bank.logo}
                            alt={bank.name}
                            className='w-full h-full object-scale-down p-1'
                          />
                        </div>
                      ) : (
                        <div className='w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center'>
                          <span className='text-gray-500 font-bold'>{bank.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className='flex-1'>
                      <h3 className='font-bold text-white group-hover:text-black'>{bank.name}</h3>
                      <p className='text-sm text-gray-200 group-hover:text-black'>{bank.accountNumber || 'No account number'}</p>
                      <p className='text-sm text-gray-200 group-hover:text-black'>{bank.accountName || 'No account name'}</p>
                    </div>

                    {isSelected && (
                      <div className='text-green-600'>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Amount Input Section */}
        <div className='mb-8'>
          <h3 className='font-bold mb-4 text-lg'>Withdrawal Amount</h3>

          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
            <div className='relative flex-1'>
              <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold'>
                ₦
              </div>
              <input
                type="number"
                placeholder="Enter amount (Minimum: ₦1,000)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className='w-full pl-10 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-300'
                min="1000"
                step="100"
              />
            </div>

            <button
              onClick={handleMaxWithdraw}
              className='px-4 py-3 bg-black text-white hover:bg-white hover:text-black rounded-lg font-medium transition-colors'
            >
              Max
            </button>
          </div>

          {/* Amount Details */}
          {withdrawAmount && !isNaN(parseFloat(withdrawAmount)) && (
            <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Amount</p>
                  <p className='font-bold'>₦{parseFloat(withdrawAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>You'll Receive</p>
                  <p className='font-bold text-green-600'>
                    ₦{parseFloat(withdrawAmount).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                No fees applied. You receive the full amount.
              </p>
            </div>
          )}

          {/* Balance Warning */}
          {withdrawAmount && parseFloat(withdrawAmount) > balance && (
            <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded'>
              <p className='text-red-600 text-sm'>
                ⚠️ Amount exceeds your available balance of ₦{balance.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Withdraw Button */}
        <div className='space-y-4'>
          <button
            onClick={handleWithdrawClick}
            disabled={loading || !selectedBank || !withdrawAmount || parseFloat(withdrawAmount) < 1000 || parseFloat(withdrawAmount) > balance}
            className='w-full sm:w-auto px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Withdraw Now'}
          </button>

          <p className='text-sm text-gray-500'>
            By clicking "Withdraw Now", you agree that your balance will be deducted immediately
            and we will process your payment within <span className='text-red-500'>Minutes</span>.
          </p>
        </div>

        {/* Recent Withdrawals (Optional) */}
        {userData?.transactions && userData.transactions.filter(t => t.type === 'withdrawal').length > 0 && (
          <div className='mt-10'>
            <h3 className='font-bold mb-4 text-lg'>Recent Withdrawals</h3>
            <div className='space-y-3'>
              {userData.transactions
                .filter(t => t.type === 'withdrawal')
                .slice(0, 3)
                .map((transaction, index) => (
                  <div key={index} className='p-3 bg-white border rounded-lg'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='font-bold'>₦{transaction.amount?.toLocaleString()}</p>
                        <p className='text-sm text-gray-600'>
                          {typeof transaction.bank === 'object' ? transaction.bank.name : transaction.bank}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span className={`px-2 py-1 rounded text-xs ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {transaction.status || 'pending'}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;