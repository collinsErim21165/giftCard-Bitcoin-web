import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import Dashboard from './components/Dashboard';
import SubmitGiftCard from './components/SubmitGiftcard.jsx';
import SellBitcoin from './components/Sellbitcoin';
import VerifyEmail from './components/Verify_email';
import ProtectedRoute from './components/ProtectedRoute.js';
import ForgetPassword from './components/Forgetpassword';
import { Sidebarpage } from './components/Sidebarpage.jsx';
import Logout from './components/Logout';
import TransactionPin from './components/TransactionPin';
import TransactionHistory from './components/TransactionHistory';
import Withdraw from './components/Withdraw';
import AdminPaymentPanel from './components/AdminPaymentPanel.jsx';
import SummaryPage from './components/SummaryPage.jsx';
import { SidebarProvider } from './components/SidebarContext.js';
import Transactions from './components/Transactions.jsx';
import Settings from './components/Settings.jsx';
import TransactionDetails from './components/TransactionDetails.jsx';
import AdminTransactionDetails from './components/AdminTransactionDetails.jsx';
import { AuthProvider } from './AuthContext.js';
import History from './components/History.jsx';
import ReceiveWallet from "./components/ReceiveWallet.jsx";
import SellPage from "./components/SellPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminUsers from "./components/AdminUsers.jsx";
import SuccessfulTransactions from './components/SuccessfullTransactions.jsx';
import CoinsSoldDashboard from './components/CoinsSoldDashboard.jsx';
import CoinDeposits from './components/CoinDeposits.jsx';
import GiftCardTransactions from './components/GiftCardsTransactions.jsx';
import GiftCardCompleted from './components/GiftCardCompleted.jsx';
import GiftCardPending from './components/GiftCardPending.jsx';
import GiftCardFailed from './components/GiftCardFailed.jsx';
import PendingCoinsSold from './components/PendingCoinsSold.jsx';
import FailedCoinsSold from './components/FailedCoinsSold.jsx';
import AdminWithdrawals from './components/AdminWithdrawals.jsx';
import AdminWalletsDashboard from './components/AdminWalletsDashboard.jsx';
import AdminWalletSweep from './components/AdminWalletSweep.jsx';
import SuccessfulSweeps from './components/SuccessfulSweeps.jsx';
import NairaNexus from './components/NairaNexus.jsx';
import AboutUs from './components/AboutUs.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import ContactUs from './components/ContactUs.jsx';
import Rates from './components/Rates.jsx';
import FAQ from './components/FAQ.jsx';


function App() {


  return (
    <div className='App'>
      <AuthProvider>
        <Router>
          <SidebarProvider>
            <Routes>
              <Route path='/signup' element={<SignUp />} />
              <Route path='/signin' element={<SignIn />} />
              <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path='/submit-gift-card' element={<SubmitGiftCard />} />
              <Route path='/sell-bitcoin' element={<SellBitcoin />} />
              <Route path='/Settings' element={<ProtectedRoute> <Settings /> </ProtectedRoute>} />
              <Route path='/verify-email' element={<VerifyEmail />} />
              <Route path='/forget-password' element={<ForgetPassword />} />
              <Route path='/History' element={<ProtectedRoute> <History /> </ProtectedRoute>} />
              <Route path='/Sidebarpage' element={<ProtectedRoute><Sidebarpage /></ProtectedRoute>} />
              <Route path='/set-pin' element={<TransactionPin />} />
              <Route path='/transaction-history' element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path='/transaction-details/:id' element={<ProtectedRoute><TransactionDetails /></ProtectedRoute>} />
              <Route path='/transactions' element={<ProtectedRoute><Transactions /> </ProtectedRoute>} />
              <Route path='/logout' element={<Logout />} />
              <Route path='/payment-panel' element={<ProtectedRoute><AdminPaymentPanel />  </ProtectedRoute>} />
              <Route path='/admin/transaction/:transactionId' element={<ProtectedRoute> <AdminTransactionDetails /></ProtectedRoute>} />
              <Route path="/successful-transactions" element={<ProtectedRoute> <SuccessfulTransactions /> </ProtectedRoute>} />
              <Route path='/withdraw' element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
              <Route path='/Gift-Card-Transactions' element={<ProtectedRoute><GiftCardTransactions /></ProtectedRoute>} />
              <Route path="/GiftCard-Successfull" element={<ProtectedRoute><GiftCardCompleted /></ProtectedRoute>} />
              <Route path="/GiftCard-Pending" element={<ProtectedRoute> <GiftCardPending /> </ProtectedRoute>} />
              <Route path="/GiftCard-Failed" element={<ProtectedRoute> <GiftCardFailed /> </ProtectedRoute>} />
              <Route path="/Coin-Deposits" element={<ProtectedRoute> <CoinDeposits /> </ProtectedRoute>} />
              <Route path='/admin-crypto-history' element={<ProtectedRoute><CoinsSoldDashboard /></ProtectedRoute>} />
              <Route path='/Pending-Coins-sold' element={<ProtectedRoute><PendingCoinsSold /></ProtectedRoute>} />
              <Route path='/Failed-Coins-Sold' element={<ProtectedRoute><FailedCoinsSold /></ProtectedRoute>} />
              <Route path='/summary' element={<SummaryPage />} />
              <Route path="/receive/:uid/:symbol" element={<ReceiveWallet />} />
              <Route path="/sellpage" element={<SellPage />} />
              <Route path="/Successful-Sweeps" element={<SuccessfulSweeps />} />
              <Route path="/admin-users" element={<AdminUsers />} />
              <Route path="/NairaNexus" element={<NairaNexus />} />
              <Route path="/Admin-Dashboard" element={<AdminDashboard />} />
              <Route path="/Admin-Wallets-Dashboard" element={<AdminWalletsDashboard />} />
              <Route path="/Admin-Wallet-Sweep" element={<AdminWalletSweep />} />
              <Route path="/Admin-Withdrawals" element={<AdminWithdrawals />} />
              <Route path='/' element={<NairaNexus />} />
              <Route path='/about' element={<AboutUs />} />
              <Route path='/how-it-works' element={<HowItWorks />} />
              <Route path='/contact' element={<ContactUs />} />
              <Route path='/rates' element={<Rates />} />
              <Route path='/faq' element={<FAQ />} />
            </Routes>
          </SidebarProvider>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;