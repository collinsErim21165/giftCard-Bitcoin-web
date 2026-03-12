import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
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
import trxIcon from "../assets/trx.svg";

// 🔥 FIREBASE
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import usePopup from "./usePopup";
import CustomPopup from "./CustomPopup";
import { useCryptoRates } from "../hooks/useCryptoRates";

/* ICON MAP */
const ICONS = {
  BTC: <SiBitcoin className="text-white w-7 h-7" />,
  ETH: <SiEthereum className="text-white w-7 h-7" />,
  USDT: <SiTether className="text-white w-7 h-7" />,
  USDC: <SiTether className="text-white w-7 h-7" />,
  TRX: <img src={trxIcon} className="w-9 h-7" alt="TRX" />,
  BCH: <SiBitcoincash className="text-white w-7 h-7" />,
  DASH: <SiDash className="text-white w-7 h-7" />,
  LTC: <SiLitecoin className="text-white w-7 h-7" />,
  BNB: <SiBinance className="text-white w-7 h-7" />,
  XRP: <SiRipple className="text-white w-7 h-7" />,
  DOGE: <SiDogecoin className="text-white w-7 h-7" />,
};

function getIconBg(symbol) {
  return (
    {
      BTC: "#f59e0b",
      ETH: "#6366f1",
      USDT: "#10b981",
      LTC: "#3b82f6",
      TRX: "#ef4444",
      BCH: "#06b6d4",
      BNB: "#fbbf24",
      DASH: "#2563eb",
      BUSD: "#f59e0b",
      USDC: "#1d4ed8",
      XRP: "#111827",
      DOGE: "#d4a437",
    }[symbol] || "#6b7280"
  );
}

const RATE_TIERS = [
  { label: "Less than $100", rate: 1250 },
  { label: "$101 — $499", rate: 1400 },
  { label: "$500 — $999", rate: 1409 },
  { label: "$1,000 and above", rate: 1419 },
];

const getNgnRate = (usd) => {
  if (usd < 100) return 1250;
  if (usd <= 499) return 1400;
  if (usd <= 999) return 1409;
  return 1419;
};

export default function SellPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { rates: cryptoRates } = useCryptoRates();

  const { symbol, walletName, balance, usdValue } = location.state || {};

  const [usdAmount, setUsdAmount] = useState("");
  const [ngnAmount, setNgnAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { popup, showPopup, closePopup } = usePopup();

  if (!symbol) {
    navigate(-1);
    return null;
  }

  // Available USD = passed usdValue, or compute from balance × live rate
  const availableUSD =
    usdValue != null
      ? usdValue
      : (balance || 0) * (cryptoRates[symbol] || 0);

  const handleUsdChange = (e) => {
    const value = e.target.value;
    setUsdAmount(value);
    const num = Number(value);
    setNgnAmount(num > 0 ? num * getNgnRate(num) : 0);
  };

  const handleSell = async () => {
    if (!user) {
      showPopup("error", "Auth Error", "Please log in and try again.", closePopup);
      return;
    }
    const num = Number(usdAmount);
    if (!num || num <= 0 || loading) return;

    if (num > availableUSD + 0.01) {
      showPopup(
        "error",
        "Insufficient Balance",
        `You only have $${availableUSD.toFixed(2)} available.`,
        closePopup
      );
      return;
    }

    setLoading(true);
    try {
      // ── 1. Deduct from wallets collection ──────────────────────────────
      const cryptoRate = cryptoRates[symbol] || 0;
      const cryptoToDeduct = cryptoRate > 0 ? num / cryptoRate : 0;

      if (cryptoToDeduct > 0) {
        const walletsSnap = await getDocs(
          query(
            collection(db, "wallets"),
            where("userId", "==", user.uid),
            where("coin", "==", symbol)
          )
        );

        let remaining = cryptoToDeduct;
        for (const walletDoc of walletsSnap.docs) {
          if (remaining <= 0) break;
          const current = Number(walletDoc.data().balance) || 0;
          const deduct = Math.min(current, remaining);
          const newBalance = Math.max(0, current - deduct);
          await updateDoc(doc(db, "wallets", walletDoc.id), {
            balance: newBalance,
            pendingBalance: newBalance, // reflected immediately in UI while sell is pending
          });
          remaining -= deduct;
        }
      }

      // ── 2. Record sell transaction ──────────────────────────────────────
      await addDoc(collection(db, "transactionHistory"), {
        userId: user.uid,
        type: "sell",
        coin: symbol,
        amount: num,
        cryptoAmount: cryptoToDeduct,
        nairaValue: ngnAmount,
        rate: getNgnRate(num),
        status: "Pending",
        txHash: null,
        sweepStatus: "idle",
        createdAt: serverTimestamp(),
      });

      showPopup("success", "Sell Submitted!", `Your ${symbol} sell request has been submitted successfully.\n\nYou will receive ₦${ngnAmount.toLocaleString()} shortly.`, () => {
        closePopup();
        navigate("/history");
      });
    } catch (err) {
      console.error("Sell error:", err);
      showPopup("error", "Sell Failed", "Failed to submit sell request. Please try again.", closePopup);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(255,240,120)]">
      {/* HEADER */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0"
        >
          <FaArrowLeft className="text-[rgb(255,240,120)] w-4 h-4" />
        </button>
        <h1 className="text-2xl font-black text-black uppercase tracking-tighter">
          Sell {symbol}
        </h1>
      </div>

      <CustomPopup popup={popup} onClose={closePopup} />

      <div className="px-4 pb-12 max-w-lg mx-auto space-y-4">

        {/* COIN INFO CARD */}
        <div className="bg-black rounded-2xl p-5 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: getIconBg(symbol) }}
          >
            {ICONS[symbol]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[rgb(255,240,120)]/50 text-[10px] font-black uppercase tracking-widest">
              Selling
            </p>
            <p className="text-[rgb(255,240,120)] text-lg font-black truncate">
              {walletName || symbol}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[rgb(255,240,120)]/50 text-[10px] font-black uppercase tracking-widest">
              Available
            </p>
            <p className="text-[rgb(255,240,120)] text-xl font-black tabular-nums">
              ${availableUSD.toFixed(2)}
            </p>
            <p className="text-[rgb(255,240,120)]/40 text-[10px] font-mono">
              {(balance || 0).toFixed(8)} {symbol}
            </p>
          </div>
        </div>

        {/* RATE TABLE */}
        <div className="bg-black rounded-2xl p-5">
          <p className="text-[rgb(255,240,120)]/50 text-[10px] font-black uppercase tracking-widest mb-3">
            Rate Table
          </p>
          <div className="space-y-0">
            {RATE_TIERS.map(({ label, rate }, i) => (
              <div
                key={label}
                className={`flex justify-between items-center py-3 ${
                  i < RATE_TIERS.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <span className="text-white/60 text-sm">{label}</span>
                <span className="text-[rgb(255,240,120)] font-black text-sm">
                  ₦{rate.toLocaleString()}/$
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SELL FORM */}
        <div className="bg-black rounded-2xl p-5">
          <p className="text-[rgb(255,240,120)]/50 text-[10px] font-black uppercase tracking-widest mb-5">
            Enter Amount
          </p>

          {/* YOU SELL */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                You Sell
              </label>
              <button
                type="button"
                onClick={() => {
                  const max = availableUSD.toFixed(2);
                  setUsdAmount(max);
                  setNgnAmount(Number(max) > 0 ? Number(max) * getNgnRate(Number(max)) : 0);
                }}
                className="px-3 py-2 rounded-full bg-[rgb(255,240,120)] text-black text-[10px] font-black uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all"
              >
                SELL ALL
              </button>
            </div>
            <div className="bg-white/10 rounded-xl flex items-center px-4 py-3 focus-within:bg-white/15 transition-colors">
              <input
                type="number"
                value={usdAmount}
                onChange={handleUsdChange}
                placeholder="0.00"
                min="0"
                max={availableUSD}
                className="bg-transparent flex-1 outline-none text-2xl font-black text-white placeholder:text-white/20 w-0"
              />
              <span className="text-[rgb(255,240,120)] font-black text-sm ml-2 flex-shrink-0">
                USD $
              </span>
            </div>
            {Number(usdAmount) > availableUSD && (
              <p className="text-red-400 text-xs font-black mt-1">
                Exceeds available balance
              </p>
            )}
          </div>

          {/* YOU GET */}
          <div className="mb-6">
            <label className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2 block">
              You Get
            </label>
            <div className="bg-white/10 rounded-xl flex items-center px-4 py-3">
              <input
                type="text"
                value={ngnAmount > 0 ? `₦${ngnAmount.toLocaleString()}` : ""}
                readOnly
                placeholder="₦0"
                className="bg-transparent flex-1 outline-none text-2xl font-black text-[rgb(255,240,120)] placeholder:text-white/20 w-0"
              />
              <span className="text-[rgb(255,240,120)] font-black text-sm ml-2 flex-shrink-0">
                NGN ₦
              </span>
            </div>
            {ngnAmount > 0 && (
              <p className="text-white/40 text-[10px] mt-1 font-mono">
                ${usdAmount} × ₦{getNgnRate(Number(usdAmount)).toLocaleString()}
              </p>
            )}
          </div>

          <button
            onClick={handleSell}
            disabled={!usdAmount || Number(usdAmount) <= 0 || Number(usdAmount) > availableUSD + 0.01 || loading}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-[rgb(255,240,120)] text-black hover:opacity-90"
          >
            {loading ? "Processing..." : `Sell ${symbol}`}
          </button>
        </div>
      </div>
    </div>
  );
}
