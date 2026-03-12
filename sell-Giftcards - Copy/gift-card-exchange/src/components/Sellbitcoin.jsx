import React, { useState, useEffect } from "react";
import { useCryptoRates } from "../hooks/useCryptoRates";
import { Sidebarpage } from "./Sidebarpage";
import { FaSyncAlt, FaChevronRight } from "react-icons/fa";
import {
  SiBitcoin,
  SiEthereum,
  SiTether,
  SiLitecoin,
  SiBitcoincash,
  SiBinance,
  SiDash,
  SiDogecoin,
  SiRipple,
} from "react-icons/si";
import axios from "axios";

import trxIcon from "../assets/trx.svg";
import BusdIcon from "../assets/Busd.png";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

/* ---------------------------------------
   ICON MAPPING
-----------------------------------------*/
const ICONS = {
  BTC: <SiBitcoin className="text-white w-6 h-6" />,
  ETH: <SiEthereum className="text-white w-6 h-6" />,
  USDT: <SiTether className="text-white w-6 h-6" />,
  LTC: <SiLitecoin className="text-white w-6 h-6" />,
  TRX: <img src={trxIcon} className="w-9 h-7 ml-3" />,
  BCH: <SiBitcoincash className="text-white w-6 h-6" />,
  BNB: <SiBinance className="text-white w-6 h-6" />,
  DASH: <SiDash className="text-white w-6 h-6" />,
  BUSD: <img src={BusdIcon} className="w-12 h-11 ml-2" />,
  USDC: <SiTether className="text-white w-6 h-6" />,
  XRP: <SiRipple className="text-white w-6 h-6" />,
  DOGE: <SiDogecoin className="text-white w-6 h-6" />,
};

/* ---------------------------------------
   WALLET NAMES
-----------------------------------------*/
const COINS = {
  BTC: "Bitcoin Wallet",
  ETH: "Ethereum Wallet",
  USDT: "Tether Wallet",
  LTC: "Litecoin Wallet",
  TRX: "Tron Wallet",
  BCH: "Bitcoin Cash",
  BNB: "Binance Wallet",
  DASH: "Dash Wallet",
  BUSD: "Binance USD",
  USDC: "USD Coin",
  XRP: "Ripple Wallet",
  DOGE: "Doge Wallet",
};

const API_BASE = "http://localhost:5000";

// 🔑 Map tokens to ETH for API fetch
const getWalletFetchSymbol = (symbol) => {
  if (symbol === "USDT" || symbol === "BUSD" || symbol === "USDC") {
    return "ETH";
  }
  return symbol;
};

const convertToUSD = (symbol, amount, rates) =>
  (rates[symbol] || 0) * amount;

/* ---------------------------------------
   🔥 FIXED: NORMALIZE FIRESTORE WALLETS
-----------------------------------------*/
function normalizeWalletsFromApi(apiWallets, rates) {
  const walletBalances = {};
  const walletAddresses = {};

  if (Array.isArray(apiWallets)) {
    apiWallets.forEach(w => {
      const coin = (w.coin || w.symbol || '').toUpperCase();
      if (!coin) return;

      // Use pendingBalance if set (funds swept but sell not yet complete), else real balance
      const displayBalance = w.pendingBalance ?? w.balance;
      walletBalances[coin] = (walletBalances[coin] || 0) + Number(displayBalance || 0);

      // Store address
      if (w.status === 'active' || !walletAddresses[coin]) {
        walletAddresses[coin] = w.address;
      }
    });
  }

  // Map to our COINS list using the actual coin symbol
  return Object.keys(COINS).map((symbol) => {
    const balance = walletBalances[symbol] || 0;
    const address = walletAddresses[symbol] || null;

    return {
      id: symbol,
      symbol,
      name: COINS[symbol],
      cryptoAmount: balance,
      usdValue: convertToUSD(symbol, balance, rates),
      address: address,
    };
  });
}

const Sellbitcoin = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activePage, setActivePage] = useState("withdrawal");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [wallets, setWallets] = useState([]);

  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const { rates: cryptoRates } = useCryptoRates();

  /* ---------------------------------------
      FETCH WALLETS (FIRESTORE)
  -----------------------------------------*/
  const fetchWallets = async () => {
    if (!uid) return;

    try {
      console.log("📡 Fetching balances from API for ALL coins...");

      // Fetch for all supported coins in parallel
      const symbolsFetch = Object.keys(COINS);
      const results = await Promise.all(
        symbolsFetch.map(s =>
          axios.get(`${API_BASE}/user-wallets/${uid}/${s}/all`)
            .then(r => r.data?.wallets || [])
            .catch(() => [])
        )
      );

      const allApiWallets = results.flat();

      // Normalize using the actual coin symbols
      const normalized = normalizeWalletsFromApi(allApiWallets, cryptoRates);
      setWallets(normalized);

      if (allApiWallets.length === 0) {
        console.log("ℹ️ No wallets found for user in API");
      }
    } catch (err) {
      console.error("❌ Error fetching wallets from API:", err);
      setWallets(normalizeWalletsFromApi([], cryptoRates));
    }
  };

  useEffect(() => {
    fetchWallets();
    const interval = setInterval(fetchWallets, 15000);
    return () => clearInterval(interval);
  }, [uid]);

  /* ---------------------------------------
      REFRESH (ALL COINS)
  -----------------------------------------*/
  const handleRefresh = async () => {
    await fetchWallets();
  };

  const totalUSD = wallets.reduce((s, w) => s + w.usdValue, 0);
  const totalBTC = wallets
    .filter((w) => w.symbol === "BTC")
    .reduce((s, w) => s + w.cryptoAmount, 0);

  const handleReceive = (wallet) => {
    setSelectedWallet(null);
    navigate(`/receive/${uid}/${wallet.symbol}`, {
      state: wallet,
    });
  };

  const handleSell = (wallet) => {
    setSelectedWallet(null);
    navigate("/sellpage", {
      state: {
        uid,
        symbol: wallet.symbol,
        balance: wallet.cryptoAmount,
        usdValue: wallet.usdValue,
        walletName: wallet.name,
      },
    });
  };

  return (
    <div className="flex flex-row w-full h-screen bg-[rgb(255,240,120)]">
      <div className={isCollapsed ? "md:mr-24" : "md:mr-48"}>
        <Sidebarpage
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          setActivePage={setActivePage}
        />
      </div>

      <div className="flex-1 bg-[rgb(255,240,120)] p-4 mt-8 md:mt-0 overflow-y-auto">
        {/* Balance Card */}
        <div className="mt-3 md:pt-0 pt-10">
          <div className="relative bg-black rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[rgb(255,240,120)] font-bold">Crypto Balance</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl text-white font-semibold">
                    ${totalUSD.toFixed(2)}
                  </span>

                  <span className="ml-3 px-3 py-1 rounded-full text-sm border text-green-600 border-green-200">
                    USD
                  </span>
                </div>

                <p className="text-sm text-green-500 mt-1">+$0 (0%)</p>
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-full border border-gray-200"
              >
                <FaSyncAlt className="text-white" />
              </button>
            </div>

            <div className="absolute left-6 bottom-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-200 opacity-80" />
              <div className="w-8 h-8 rounded-full bg-green-200 opacity-80 -ml-3" />
              <div className="w-8 h-8 rounded-full bg-purple-300 opacity-80 -ml-3" />
            </div>
          </div>
        </div>

        {/* Wallet List */}
        <div className="mt-6 space-y-5 pb-20">
          {wallets.map((w) => (
            <div
              key={w.symbol}
              onClick={() => setSelectedWallet(w)}
              className="group relative bg-black rounded-xl p-4 flex items-center justify-between cursor-pointer border border-transparent hover:border-[rgb(255,240,120)]/30 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient overlay — black left, yellow right */}
              <div className="absolute inset-0 bg-gradient-to-r from-black to-[rgb(255,240,120)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

              <div className="relative z-10 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: getIconBg(w.symbol) }}
                >
                  {ICONS[w.symbol]}
                </div>
                <div>
                  <div className="font-semibold text-white">{w.symbol}</div>
                  <div className="text-sm text-gray-400">{w.name}</div>
                </div>
              </div>
              <FaChevronRight className="relative z-10 text-gray-400" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="fixed left-0 right-0 bottom-4 px-4">
          <div className="mx-auto max-w-xl bg-white rounded-full py-3 shadow-lg flex justify-between px-5 items-center">
            <div>
              <div className="text-sm text-gray-500">Total BTC</div>
              <div className="font-semibold">{totalBTC.toFixed(8)} BTC</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total USD</div>
              <div className="font-semibold">${totalUSD.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {selectedWallet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-[rgb(255,240,120)] rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm border border-black/10 transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"
                style={{ background: 'black' }}
              >
                <div className="transform -rotate-3 scale-125">
                  {ICONS[selectedWallet.symbol]}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-black leading-tight">{selectedWallet.name}</h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black text-[rgb(255,240,120)] uppercase tracking-tighter">
                    {selectedWallet.symbol} Network
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-black/5 hover:bg-white/60 transition-colors">
                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">Available crypto</p>
                <p className="text-xl font-mono font-black text-black truncate">
                  {selectedWallet.cryptoAmount.toFixed(8)}
                </p>
              </div>

              <div className="bg-black rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[rgb(255,240,120)] opacity-5 -mr-12 -mt-12 rounded-full transform group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-[10px] font-black text-[rgb(255,240,120)]/40 uppercase tracking-widest mb-1">Est. USD Value</p>
                <p className="text-3xl font-black text-[rgb(255,240,120)] tabular-nums">
                  ${selectedWallet.usdValue.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleReceive(selectedWallet)}
                className="flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-md border-2 border-transparent hover:border-black"
              >
                RECEIVE
              </button>
              <button
                onClick={() => handleSell(selectedWallet)}
                className="flex items-center justify-center gap-2 py-4 bg-black text-[rgb(255,240,120)] rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                SELL
              </button>
            </div>

            <button
              onClick={() => setSelectedWallet(null)}
              className="mt-4 w-full py-4 text-black/40 hover:text-black font-black text-xs tracking-widest transition-colors uppercase"
            >
              ← Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------
   ICON BACKGROUND COLORS
-----------------------------------------*/
function getIconBg(symbol) {
  return {
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
  }[symbol] || "#6b7280";
}

export default Sellbitcoin;