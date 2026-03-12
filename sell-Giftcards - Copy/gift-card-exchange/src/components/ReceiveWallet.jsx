import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import { useCryptoRates } from "../hooks/useCryptoRates";

const API_BASE = "http://localhost:5000";

// 🔑 IMPORTANT: map tokens to ETH wallet generation
const getWalletGenerationSymbol = (symbol) => {
  if (symbol === "USDT" || symbol === "BUSD" || symbol === "USDC") {
    return "ETH";
  }
  return symbol;
};

// 🔑 Check if symbol is an ERC-20 token
const isERC20Token = (symbol) => {
  return symbol === "USDT" || symbol === "BUSD" || symbol === "USDC";
};

function ReceiveWallet() {
  const { uid, symbol } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { rates: cryptoRates } = useCryptoRates();

  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [inactiveWallets, setInactiveWallets] = useState([]);
  const [balance, setBalance] = useState(0); // ✅ This is ONLY active wallet balance
  const [loading, setLoading] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [hasInactiveWithBalance, setHasInactiveWithBalance] = useState(false);

  // -----------------------------
  // Load ALL user wallets (not just active)
  // -----------------------------
  useEffect(() => {
    const fetchAllWallets = async () => {
      try {
        setLoading(true);

        const fetchSymbol = getWalletGenerationSymbol(symbol);
        const res = await axios.get(`${API_BASE}/user-wallets/${uid}/${fetchSymbol}/all`);

        if (res.data?.wallets && res.data.wallets.length > 0) {
          const allWallets = res.data.wallets;
          const active = allWallets.find(w => w.status === "active");
          const inactive = allWallets.filter(w => w.status === "inactive");

          setWallets(allWallets);
          setActiveWallet(active || null);
          setInactiveWallets(inactive);

          const hasBalanceInactive = inactive.some(w => w.balance > 0);
          setHasInactiveWithBalance(hasBalanceInactive);

          if (active) {
            setBalance(active.balance || 0);
          } else {
            setBalance(0);
          }
        } else {
          setWallets([]);
          setActiveWallet(null);
          setInactiveWallets([]);
          setBalance(0);
        }
      } catch (err) {
        console.error("Error fetching wallets:", err);
        setWallets([]);
        setActiveWallet(null);
        setInactiveWallets([]);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    if (uid && symbol) fetchAllWallets();
  }, [uid, symbol]);

  // -----------------------------
  // 🔥 BALANCE REFRESH
  // -----------------------------
  useEffect(() => {
    if (!uid || !symbol) return;

    let mounted = true;

    const refreshBalances = async () => {
      try {
        const fetchSymbol = getWalletGenerationSymbol(symbol);
        const res = await axios.get(`${API_BASE}/user-wallets/${uid}/${fetchSymbol}/all`);

        if (mounted && res.data?.wallets) {
          const allWallets = res.data.wallets;
          const active = allWallets.find(w => w.status === "active");
          const inactive = allWallets.filter(w => w.status === "inactive");

          setWallets(allWallets);
          setActiveWallet(active || null);
          setInactiveWallets(inactive);

          const hasBalanceInactive = inactive.some(w => w.balance > 0);
          setHasInactiveWithBalance(hasBalanceInactive);

          if (active) {
            setBalance(active.balance || 0);
          } else {
            setBalance(0);
          }
        }
      } catch (err) {
        console.error("Balance refresh error:", err);
      }
    };

    refreshBalances();
    const interval = setInterval(refreshBalances, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [uid, symbol]);

  // -----------------------------
  // Generate NEW wallet
  // -----------------------------
  const generateNewWallet = async () => {
    try {
      setLoading(true);

      const generationSymbol = getWalletGenerationSymbol(symbol);

      await axios.post(
        `${API_BASE}/wallet/generate/${generationSymbol}/${uid}`
      );

      const refreshRes = await axios.get(`${API_BASE}/user-wallets/${uid}/${generationSymbol}/all`);

      if (refreshRes.data?.wallets) {
        const allWallets = refreshRes.data.wallets;
        const active = allWallets.find(w => w.status === "active");
        const inactive = allWallets.filter(w => w.status === "inactive");

        setWallets(allWallets);
        setActiveWallet(active || null);
        setInactiveWallets(inactive);

        if (active) {
          setBalance(active.balance || 0);
        }
      }

      setPopupMessage("New wallet generated successfully!");
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      setPopupMessage("Failed to generate new wallet");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // DEACTIVATE wallet
  // -----------------------------
  const deactivateWallet = async () => {
    if (!activeWallet?.id) {
      setPopupMessage("No active wallet to deactivate");
      setShowPopup(true);
      return;
    }

    if (activeWallet.balance > 0) {
      setPopupMessage("Cannot deactivate wallet with balance. Please withdraw funds first.");
      setShowPopup(true);
      return;
    }

    try {
      setDeactivating(true);

      const deletionSymbol = getWalletGenerationSymbol(symbol);

      await axios.post(`${API_BASE}/wallet/deactivate/${deletionSymbol}/${uid}`);

      const refreshRes = await axios.get(`${API_BASE}/user-wallets/${uid}/${deletionSymbol}/all`);

      if (refreshRes.data?.wallets) {
        const allWallets = refreshRes.data.wallets;
        const active = allWallets.find(w => w.status === "active");
        const inactive = allWallets.filter(w => w.status === "inactive");

        setWallets(allWallets);
        setActiveWallet(active || null);
        setInactiveWallets(inactive);

        if (active) {
          setBalance(active.balance || 0);
        } else {
          setBalance(0);
        }
      }

      setShowDeactivateModal(false);
      setPopupMessage("Wallet deactivated successfully");
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      setPopupMessage(err.response?.data?.error || "Failed to deactivate wallet");
      setShowPopup(true);
    } finally {
      setDeactivating(false);
    }
  };

  const handleCopy = () => {
    if (!activeWallet?.address) return;

    navigator.clipboard.writeText(activeWallet.address);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const goBack = () => navigate(-1);

  const usdValue = balance * (cryptoRates[symbol] || 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[rgb(255,240,120)] p-6 text-center relative overflow-x-hidden">
      {/* Back Button */}
      <button
        onClick={goBack}
        className="absolute top-8 left-8 text-black opacity-40 hover:opacity-100 flex items-center gap-2 font-black uppercase text-xs tracking-widest transition-all"
      >
        <FaArrowLeft className="w-3 h-3" /> <span>Back</span>
      </button>


      {/* 🔥 BALANCE DISPLAY */}
      <div className="text-lg font-semibold mb-8 mt-10 space-y-2">
        <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">
          {activeWallet ? "Available Balance" : "No Active Wallet"}
        </p>
        <p className="text-4xl font-black text-black tabular-nums tracking-tighter">
          {typeof balance === "number" ? balance.toFixed(8) : "0.00000000"} <span className="text-xl opacity-40">{symbol}</span>
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-black/5 rounded-full border border-black/5">
          <p className="text-lg font-black text-black/60">
            ≈ ${usdValue.toFixed(2)} <span className="text-sm opacity-50 uppercase font-black">USD</span>
          </p>
        </div>

      </div>

      {/* Wallet Display */}
      {activeWallet ? (
        <>
          <div className="bg-black rounded-[2.5rem] p-8 shadow-2xl w-full max-w-md relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(255,240,120)] opacity-5 -mr-16 -mt-16 rounded-full transform group-hover:scale-150 transition-all duration-700"></div>

            <div className="absolute top-6 right-6">
              <span className="bg-[#22c55e] text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                ACTIVE
              </span>
            </div>

            <div className="bg-white p-4 rounded-3xl mx-auto mb-8 w-fit shadow-xl relative z-10">
              {activeWallet.address && (
                <QRCodeCanvas value={activeWallet.address} size={180} />
              )}
            </div>

            <div className="relative z-10 text-center">
              <p className="text-[rgb(255,240,120)]/50 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{symbol} Wallet Address</p>
              <p className="text-xs text-white/40 mb-4 tracking-wider">
                Network: <span className="text-white font-black">{isERC20Token(symbol) ? "ERC-20 (Ethereum)" : symbol}</span>
                {activeWallet.network && <span className="ml-1 opacity-60">({activeWallet.network})</span>}
              </p>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-8">
                <p className="font-mono text-white text-[10px] sm:text-xs break-all leading-relaxed tracking-wider">{activeWallet.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCopy}
                  className="bg-[rgb(255,240,120)] text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  {copySuccess || "Copy"}
                </button>

                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${activeWallet.balance > 0
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-[#ef4444] text-white hover:scale-105 active:scale-95 shadow-red-500/20 shadow-lg'
                    }`}
                  disabled={activeWallet.balance > 0}
                >
                  Deactivate
                </button>
              </div>

              {activeWallet.balance > 0 && (
                <p className="text-[10px] text-red-500 mt-4 font-black uppercase tracking-widest animate-pulse">
                  ⚠️ Withdraw funds before deactivating
                </p>
              )}

              <p className="mt-8 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                Minimum deposit: <span className="text-white">0.00001 {symbol} ($1)</span>
              </p>
            </div>
          </div>

          <div className="mt-8 w-full max-w-md text-left space-y-3 px-4">
            {[
              { icon: "💰", text: "This is your active wallet address." },
              { icon: "🚨", text: "Old wallets remain valid - deposits to old addresses are still detected." },
              { icon: "💱", text: "All coins received can be converted to Naira at your own convenience." },
              { icon: "⚡", text: `You can only send ${symbol} to this wallet address.` },
              { icon: "🌐", text: isERC20Token(symbol) ? "Network: ERC-20 (Ethereum)." : `Network: ${symbol.toLowerCase()}.` }
            ].map((info, idx) => (
              <div key={idx} className="flex items-center gap-3 py-1">
                <span className="text-xl">{info.icon}</span>
                <p className="text-[11px] font-bold text-black/50 uppercase tracking-tight">{info.text}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center mt-10">
          <img
            src="https://i.imgur.com/yW2W9SC.png"
            alt="No Wallet"
            className="w-20 h-20 mx-auto mb-3"
            style={{ filter: "brightness(0)" }}
          />

          <p className="text-red-500 mb-6 font-black uppercase text-xs tracking-widest">You don't have a wallet address yet</p>

          <button
            onClick={generateNewWallet}
            disabled={loading}
            className="bg-black text-[rgb(255,240,120)] px-10 py-5 rounded-2xl flex items-center justify-center gap-4 mx-auto min-w-[250px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all outline-none"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-[rgb(255,240,120)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? "Generating..." : inactiveWallets.length > 0 ? "Create New Active Wallet" : `Generate ${symbol} Wallet`}
          </button>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && activeWallet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(255,240,120)] rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl border border-black/10 transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <FaExclamationTriangle className="text-[rgb(255,240,120)]" size={32} />
            </div>
            <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tighter">Deactivate?</h3>
            <p className="text-xs font-black text-black/40 uppercase tracking-widest mb-8">
              This wallet will no longer be visible as active.
            </p>

            {activeWallet.balance > 0 && (
              <div className="bg-red-500 text-white p-4 rounded-2xl mb-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                Wallet has {activeWallet.balance} {symbol}!<br />Withdraw first.
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={deactivateWallet}
                disabled={deactivating || activeWallet.balance > 0}
                className="w-full bg-black text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 hover:bg-black/90 transition-all"
              >
                {deactivating ? "Deactivating..." : "Yes, Deactivate"}
              </button>

              <button
                onClick={() => setShowDeactivateModal(false)}
                className="w-full py-4 text-black/40 hover:text-black font-black text-xs uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
            <p className="text-sm font-black text-black uppercase tracking-tight mb-8 leading-relaxed">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-black text-[rgb(255,240,120)] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiveWallet;