import { useState, useEffect } from 'react';

export const FALLBACK_RATES = {
  BTC: 64800.0,
  ETH: 1865.0,
  USDT: 1.0,
  LTC: 51.89,
  TRX: 0.28,
  BCH: 501.0,
  BNB: 598.0,
  DASH: 28.0,
  BUSD: 1.0,
  USDC: 1.0,
  XRP: 1.37,
  DOGE: 0.094,
};

// Stablecoins are always pegged to $1
const STABLE_COINS = { USDT: 1.0, USDC: 1.0, BUSD: 1.0 };

// Binance USDT pairs — free public API, no key required
const BINANCE_SYMBOLS = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  LTC: 'LTCUSDT',
  TRX: 'TRXUSDT',
  BCH: 'BCHUSDT',
  BNB: 'BNBUSDT',
  DASH: 'DASHUSDT',
  XRP: 'XRPUSDT',
  DOGE: 'DOGEUSDT',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Module-level cache shared across all hook instances
let _cachedRates = null;
let _cacheTime = 0;
let _fetchPromise = null;

// Fetch with an 8-second timeout so the hook never hangs
const fetchWithTimeout = async (url, ms = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
};

const fetchLiveRates = async () => {
  if (_fetchPromise) return _fetchPromise;

  const symbolsParam = encodeURIComponent(
    JSON.stringify(Object.values(BINANCE_SYMBOLS))
  );
  const url = `https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`;

  _fetchPromise = fetchWithTimeout(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // data = [{symbol:"BTCUSDT", price:"64800.12"}, ...]
      const symbolToPrice = {};
      data.forEach(({ symbol, price }) => {
        symbolToPrice[symbol] = parseFloat(price);
      });

      const newRates = { ...STABLE_COINS };
      Object.entries(BINANCE_SYMBOLS).forEach(([coin, binanceSymbol]) => {
        newRates[coin] = symbolToPrice[binanceSymbol] ?? FALLBACK_RATES[coin];
      });

      _cachedRates = newRates;
      _cacheTime = Date.now();
      console.log('[useCryptoRates] Live rates loaded:', newRates);
      return newRates;
    })
    .catch((err) => {
      console.warn('[useCryptoRates] API failed, using fallback rates:', err.message);
      return FALLBACK_RATES;
    })
    .finally(() => {
      _fetchPromise = null;
    });

  return _fetchPromise;
};

/**
 * Returns live USD conversion rates for supported crypto coins.
 * Primary source: Binance public REST API (no API key needed).
 * Falls back to hardcoded rates if the API is unavailable.
 *
 * Usage:
 *   const { rates, ratesLoading } = useCryptoRates();
 *   const usdValue = amount * (rates[coin] ?? 0);
 */
export const useCryptoRates = () => {
  const isCacheValid = _cachedRates && Date.now() - _cacheTime < CACHE_DURATION;

  const [rates, setRates] = useState(isCacheValid ? _cachedRates : FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(!isCacheValid);

  useEffect(() => {
    if (isCacheValid) return; // Already have fresh cached data

    fetchLiveRates().then((newRates) => {
      setRates(newRates);
      setRatesLoading(false);
    });
  }, []);

  return { rates, ratesLoading };
};
