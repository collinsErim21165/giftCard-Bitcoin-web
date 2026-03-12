import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from 'react-router-dom';
import TransactionHistory from './TransactionHistory';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { CiCreditCard2 } from "react-icons/ci";
import { FaBitcoin, FaWhatsapp } from "react-icons/fa";
import { Sidebarpage } from './Sidebarpage';
import Loader from './Loader';
import NairaNexus from "../assets/NairaNexus.png";
import TransactionPinPopup from './TransactionPin'; // Import the popup component

const Dashboard = () => {
  const [userData, setUserData] = useState({ balance: 0 });
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPinPopupOpen, setIsPinPopupOpen] = useState(false); // State for PIN popup

  const navigate = useNavigate();

  const phoneNumber = "+2349093727037";
  const message = "Hello, I need support";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    let unsubAuth;
    let unsubSnap;

    unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/signin');
        return;
      }

      const ref = doc(db, "users", user.uid);
      unsubSnap = onSnapshot(ref, (snap) => {
        setUserData(snap.exists() ? snap.data() : { balance: 0 });
        setLoading(false);
      });
    });

    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubSnap) unsubSnap();
    };
  }, [navigate]);

  // Check URL for pin parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('setpin') === 'true') {
      setIsPinPopupOpen(true);
    }
  }, []);

  // Format balance function
  const formatBalance = (balance) => {
    const amount = parseFloat(balance || 0);
    return amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[rgb(255,240,120)] flex">

      {/* SIDEBAR */}
      <div className={`${isCollapsed ? 'md:w-24 w-14' : 'md:w-52 w-14'} transition-all`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* MAIN CONTENT */}
      <div className="md:flex-1 md:-ml-0 -ml-12 items-start justify-start md:p-3  space-y-3">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:-mt-16 -mt-0 md:-mb-16 -mb-0  md:pt-0 pt-28 items-center justify-between gap-4">
          <img src={NairaNexus} className="h-32 md:h-48 md:flex hidden md:-ml-10" alt="NairaNexus" />

          <a
            href={whatsappLink}
            className="flex items-center gap-2 bg-black text-white border border-white/20 md:-ml-0 -ml-20 md:px-4 px-6 py-4 md:py-2 rounded-md font-serif hover:bg-white hover:text-black transition"
          >
            <FaWhatsapp size={20} />
            Contact Support
          </a>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-black">
          Welcome, {userData.fullName}
        </h2>

        {/* BALANCE + ACTIONS */}
        <div className="flex flex-col pb-5 lg:flex-row gap-8 items-center">

          {/* NAIRA BALANCE */}
          <div className="bg-black text-white rounded-xl w-[360px] lg:w-[32%] h-52 flex flex-col items-center justify-center gap-4">
            <p className="text-xl font-bold">Your Naira Balance</p>

            <div className="flex items-center gap-4">
              <span className="text-2xl md:text-3xl font-bold">
                {balanceVisible ? `₦${formatBalance(userData.balance)}` : '•••••••'}
              </span>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="hover:opacity-80 transition-opacity"
              >
                {balanceVisible ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
              </button>
            </div>

            <button
              onClick={() => navigate('/withdraw')}
              className="bg-[rgb(255,240,120)] text-black px-8 py-3 rounded-lg hover:opacity-90 hover:shadow-lg transition font-bold"
            >
              Withdraw
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-6 w-full lg:w-auto justify-center">

            <Link
              to="/submit-gift-card"
              className="h-32 w-28 md:h-36 md:w-36 bg-black text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white hover:text-black hover:shadow-xl transition font-bold"
            >
              <CiCreditCard2 className="h-16 w-16" />
              <p className="text-center">Trade GiftCards</p>
            </Link>

            <button
              onClick={() => navigate('/sell-bitcoin')}
              className="h-32 w-28 md:h-36 md:w-36 bg-black text-white rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white hover:text-black hover:shadow-xl transition font-bold"
            >
              <FaBitcoin className="h-14 w-14" />
              <p className="text-center">Trade <br className='md:hidden flex' /> Bitcoin</p>
            </button>

          </div>
        </div>

        {/* TRANSACTIONS */}
        <TransactionHistory />

        {/* PIN */}
        {userData.transactionPin ? (
          <p className="text-sm text-black/60">Transaction PIN is set.</p>
        ) : (
          <button
            className="text-black underline hover:text-black/70 font-medium"
            onClick={() => setIsPinPopupOpen(true)} // Open popup instead of navigating
          >
            Set Transaction PIN
          </button>
        )}
      </div>

      {/* PIN Popup */}
      <TransactionPinPopup
        isOpen={isPinPopupOpen}
        onClose={() => setIsPinPopupOpen(false)}
      />
    </div>
  );
};

export default Dashboard;