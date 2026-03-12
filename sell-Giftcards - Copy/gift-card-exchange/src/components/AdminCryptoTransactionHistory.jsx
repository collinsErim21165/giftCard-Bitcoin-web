import { useState, useEffect, useRef } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useCryptoRates } from '../hooks/useCryptoRates';

/* COIN ICONS */
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

const COIN_ICONS = {
  BTC: <SiBitcoin className="text-orange-400 text-xl" />,
  ETH: <SiEthereum className="text-indigo-400 text-xl" />,
  USDT: <SiTether className="text-green-400 text-xl" />,
  USDC: <SiTether className="text-blue-400 text-xl" />,
  TRX: <img src={trxIcon} alt="TRX" className="w-5 h-5" />,
  BCH: <SiBitcoincash className="text-cyan-400 text-xl" />,
  DASH: <SiDash className="text-white text-xl" />,
  LTC: <SiLitecoin className="text-blue-400 text-xl" />,
  BNB: <SiBinance className="text-yellow-400 text-xl" />,
  XRP: <SiRipple className="text-white text-xl" />,
  DOGE: <SiDogecoin className="text-yellow-400 text-xl" />,
  BUSD: <SiBinance className="text-yellow-300 text-xl" />,
};

const CRYPTO_COINS = [
  'BTC','ETH','USDT','USDC','LTC',
  'TRX','BCH','BNB','DASH','XRP',
  'DOGE','BUSD'
];

const YELLOW = 'rgb(255,240,120)';

const AdminCryptoTransactionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { rates: cryptoRates, ratesLoading } = useCryptoRates();
  const cryptoRatesRef = useRef(cryptoRates);
  useEffect(() => { cryptoRatesRef.current = cryptoRates; }, [cryptoRates]);

  useEffect(() => {
    if (ratesLoading) return;

    const fetchAllHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'transactionHistory'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);

        const list = await Promise.all(
          snap.docs.map(async (txDoc) => {
            const d = txDoc.data();
            const coin = (d.coin || d.asset || '').toUpperCase();
            if (!CRYPTO_COINS.includes(coin)) return null;

            let fullName = 'Unknown User';
            if (d.userId) {
              const userSnap = await getDoc(doc(db, 'users', d.userId));
              if (userSnap.exists()) {
                fullName = userSnap.data().fullName || 'Unnamed User';
              }
            }

            const direction =
              d.direction?.toUpperCase() ||
              (d.nairaValue > 0 ? 'SELL' : 'DEPOSIT');

            const cryptoAmount = Number(d.cryptoAmount || 0);

            let usdAmount;
            if (direction === 'DEPOSIT' && cryptoAmount > 0) {
              usdAmount = cryptoAmount * (cryptoRatesRef.current[coin] || 0);
            } else {
              usdAmount = Number(d.amount || d.usdAmount || 0);
              if (usdAmount === 0 && cryptoAmount > 0) {
                usdAmount = cryptoAmount * (cryptoRatesRef.current[coin] || 0);
              }
            }

            return {
              id: txDoc.id,
              fullName,
              coin,
              direction,
              cryptoAmount,
              usdAmount,
              nairaValue: Number(d.nairaValue || 0),
              status: d.status || 'Completed',
              createdAt: d.createdAt?.toDate() || new Date(),
            };
          })
        );

        setHistory(list.filter(Boolean));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistory();
  }, [ratesLoading]);

  const filteredHistory = history.filter(tx =>
    filter === 'all' ? true : tx.direction === filter.toUpperCase()
  );

  const depositCount  = history.filter(h => h.direction === 'DEPOSIT').length;
  const sellCount     = history.filter(h => h.direction === 'SELL').length;
  const totalUSD      = history.reduce((sum, h) => sum + h.usdAmount, 0);
  const depositVolume = history.filter(h => h.direction === 'DEPOSIT').reduce((s, h) => s + h.usdAmount, 0);

  return (
    <div className="flex flex-col bg-black min-h-screen w-full">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="bg-black border-b border-white/10 flex-shrink-0">
        <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: YELLOW }}>
              Sell &amp; Deposit History
            </h2>
            <p className="text-sm text-white/40 mt-0.5">
              All user crypto transactions &mdash; live USD rates applied
            </p>
          </div>

          {/* filter pills */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all',     label: `All (${history.length})`,      active: `text-black font-bold`,           idle: 'bg-white/10 text-white/60 hover:bg-white/20' },
              { key: 'deposit', label: `Deposits (${depositCount})`,   active: 'bg-emerald-500 text-white font-bold', idle: 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60' },
              { key: 'sell',    label: `Sells (${sellCount})`,         active: 'bg-rose-500 text-white font-bold',    idle: 'bg-rose-900/40 text-rose-400 hover:bg-rose-900/60' },
            ].map(({ key, label, active, idle }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${filter === key ? active : idle}`}
                style={filter === key && key === 'all' ? { backgroundColor: YELLOW } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS STRIP ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-t border-white/10"
             style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {[
            { label: 'Total Transactions', value: history.length,       color: YELLOW },
            { label: 'Deposits',           value: depositCount,          color: '#34d399' },
            { label: 'Sells',              value: sellCount,             color: '#fb7185' },
            { label: 'Deposit Volume',     value: `$${depositVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#818cf8' },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-3 bg-black">
              <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 md:p-6">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-10 h-10 border-4 border-white/10 rounded-full animate-spin"
                   style={{ borderTopColor: YELLOW }} />
              <p className="text-white/40 text-sm">Loading transactions…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">⚠</span>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {filteredHistory.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-white/70 font-semibold">No transactions found</p>
                  <p className="text-white/30 text-sm mt-1">Try a different filter</p>
                </div>
              ) : (
                <>
                  {/* ── MOBILE CARDS ───────────────────── */}
                  <div className="md:hidden space-y-3">
                    {filteredHistory.map((tx, i) => (
                      <div
                        key={tx.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4"
                      >
                        {/* top row */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-white">{tx.fullName}</p>
                            <p className="text-xs text-white/30 mt-0.5">#{i + 1}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            tx.direction === 'DEPOSIT'
                              ? 'bg-emerald-900/60 text-emerald-400'
                              : 'bg-rose-900/60 text-rose-400'
                          }`}>
                            {tx.direction}
                          </span>
                        </div>

                        {/* coin + amount */}
                        <div className="flex items-center justify-between py-2.5 border-y border-white/10 mb-3">
                          <div className="flex items-center gap-2">
                            {COIN_ICONS[tx.coin]}
                            <span className="font-bold text-white">{tx.coin}</span>
                          </div>
                          <span className="font-mono text-sm text-indigo-300 font-semibold">
                            {tx.cryptoAmount.toFixed(8)}
                          </span>
                        </div>

                        {/* values grid */}
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="bg-blue-900/30 rounded-lg p-2">
                            <p className="text-xs text-blue-400 font-medium">USD</p>
                            <p className="font-bold text-blue-300">${tx.usdAmount.toFixed(2)}</p>
                          </div>
                          <div className="bg-emerald-900/30 rounded-lg p-2">
                            <p className="text-xs text-emerald-400 font-medium">NGN</p>
                            <p className="font-bold text-emerald-300">
                              {tx.nairaValue ? `₦${tx.nairaValue.toLocaleString()}` : '—'}
                            </p>
                          </div>
                        </div>

                        {/* footer */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              tx.status === 'Completed'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              {tx.status}
                            </span>
                            <p className="text-xs text-white/30 mt-1">
                              {tx.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/admin/transaction/${tx.id}`)}
                            className="text-black text-sm px-4 py-2 rounded-xl font-bold transition-opacity hover:opacity-80"
                            style={{ backgroundColor: YELLOW }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── DESKTOP TABLE ───────────────────── */}
                  <div className="hidden md:block bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max">
                        <thead>
                          <tr className="border-b border-white/10" style={{ backgroundColor: 'rgba(255,240,120,0.07)' }}>
                            {['#','User','Type','Coin','Crypto Amount','USD Value','NGN Value','Status','Date','Action'].map(h => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                                style={{ color: YELLOW }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                          {filteredHistory.map((tx, i) => (
                            <tr
                              key={tx.id}
                              className="hover:bg-white/5 transition-colors group"
                            >
                              <td className="px-4 py-3 text-sm text-white/30 font-medium">{i + 1}</td>

                              <td className="px-4 py-3">
                                <p className="font-semibold text-white text-sm">{tx.fullName}</p>
                              </td>

                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  tx.direction === 'DEPOSIT'
                                    ? 'bg-emerald-900/60 text-emerald-400'
                                    : 'bg-rose-900/60 text-rose-400'
                                }`}>
                                  {tx.direction === 'DEPOSIT' ? '↓ ' : '↑ '}{tx.direction}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {COIN_ICONS[tx.coin]}
                                  <span className="font-bold text-sm text-white">{tx.coin}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3 font-mono text-sm text-indigo-300 font-semibold">
                                {tx.cryptoAmount.toFixed(8)}
                              </td>

                              <td className="px-4 py-3">
                                <span className="font-bold text-sm text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-lg">
                                  ${tx.usdAmount.toFixed(2)}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <span className={`font-semibold text-sm ${tx.nairaValue ? 'text-emerald-400' : 'text-white/20'}`}>
                                  {tx.nairaValue ? `₦${tx.nairaValue.toLocaleString()}` : '—'}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  tx.status === 'Completed'
                                    ? 'bg-green-900/50 text-green-400'
                                    : 'bg-yellow-900/50 text-yellow-400'
                                }`}>
                                  {tx.status}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-sm text-white/40 whitespace-nowrap">
                                {tx.createdAt.toLocaleString()}
                              </td>

                              <td className="px-4 py-3">
                                <button
                                  onClick={() => navigate(`/admin/transaction/${tx.id}`)}
                                  className="text-black text-xs px-3 py-1.5 rounded-lg font-bold transition-opacity hover:opacity-80"
                                  style={{ backgroundColor: YELLOW }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* table footer */}
                    <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-white/40">
                        Showing <span className="font-semibold text-white/70">{filteredHistory.length}</span> of <span className="font-semibold text-white/70">{history.length}</span> transactions
                      </p>
                      <p className="text-xs text-white/30">
                        Total volume: <span className="font-semibold" style={{ color: YELLOW }}>
                          ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCryptoTransactionHistory;
