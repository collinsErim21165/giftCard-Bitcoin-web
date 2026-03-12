path = r"c:/Users/Hp/OneDrive/Desktop/sell-Giftcards - Copy/gift-card-exchange/src/components/CoinDeposits.jsx"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# ── Back button ─────────────────────────────────────────────────────────────────
c = c.replace('text-black hover:text-blue-800 font-medium', 'text-black/60 hover:text-black font-medium')

# ── Page h1 + subtitle ──────────────────────────────────────────────────────────
c = c.replace('text-2xl lg:text-3xl font-bold text-gray-900', 'text-2xl lg:text-3xl font-bold text-black')
c = c.replace('"text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base"', '"text-black/60 mt-1 lg:mt-2 text-sm lg:text-base"')

# ── Refresh button ───────────────────────────────────────────────────────────────
c = c.replace(
    'bg-black text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2 text-sm lg:text-base',
    'bg-black text-[rgb(255,240,120)] rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm lg:text-base'
)

# ── Status summary badges ────────────────────────────────────────────────────────
c = c.replace('bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2',
              'bg-white/10 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2')
c = c.replace('bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2',
              'bg-white/10 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2')
c = c.replace('bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 flex items-center gap-2',
              'bg-white/10 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2')
c = c.replace('text-blue-700', 'text-[rgb(255,240,120)]')
c = c.replace('text-green-700', 'text-green-400')
c = c.replace('text-purple-700', 'text-purple-400')

# ── Error box ────────────────────────────────────────────────────────────────────
c = c.replace('bg-red-50 border border-red-200 rounded-lg', 'bg-red-900/20 border border-red-500/30 rounded-lg')
c = c.replace('text-red-600 text-sm lg:text-base', 'text-red-400 text-sm lg:text-base')
c = c.replace('text-sm text-red-600 hover:text-red-800', 'text-sm text-red-400 hover:text-red-300')

# ── Debug/empty info box ─────────────────────────────────────────────────────────
c = c.replace('bg-yellow-50 border border-yellow-200 rounded-lg',
              'bg-yellow-400/10 border border-yellow-400/30 rounded-lg')
c = c.replace('text-yellow-700 text-sm', 'text-yellow-400 text-sm')
c = c.replace('text-yellow-600 text-xs mt-1', 'text-yellow-400 text-xs mt-1')

# ── Search input ─────────────────────────────────────────────────────────────────
c = c.replace(
    'bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base',
    'bg-black text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm lg:text-base'
)
c = c.replace('transform -translate-y-1/2 text-gray-400', 'transform -translate-y-1/2 text-white/40')

# ── Filter buttons (22-space indent — use multiline to avoid clash with pagination) ──
c = c.replace(
    "? 'bg-blue-600 text-white'\n                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'",
    "? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'\n                      : 'bg-black/30 border border-black/20 text-black hover:bg-black/50'"
)

# ── Sort select ──────────────────────────────────────────────────────────────────
c = c.replace(
    'px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
    'px-3 py-2 bg-black text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm'
)

# ── Sort button ──────────────────────────────────────────────────────────────────
c = c.replace(
    'px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
    'px-3 py-2 bg-black text-white border border-white/20 rounded-lg hover:bg-white/10 flex items-center gap-2 focus:outline-none focus:border-[rgb(255,240,120)] text-sm'
)

# ── coinDetail avatar circle ─────────────────────────────────────────────────────
c = c.replace('w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center',
              'w-16 h-16 rounded-full bg-white/10 flex items-center justify-center')

# ── coinDetail h2 (on yellow bg) ─────────────────────────────────────────────────
c = c.replace('"text-2xl font-bold text-gray-900"', '"text-2xl font-bold text-black"')

# ── coinDetail stat cards ─────────────────────────────────────────────────────────
c = c.replace('bg-white rounded-xl p-6 shadow-sm border border-gray-200',
              'bg-black rounded-xl p-6 border border-white/10')
c = c.replace('"text-gray-500 text-sm font-medium"', '"text-white/40 text-sm font-medium"')
c = c.replace('"text-2xl font-bold text-gray-900 mt-2"',
              '"text-2xl font-bold text-[rgb(255,240,120)] mt-2"')
c = c.replace('"text-sm text-gray-500 mt-1"', '"text-sm text-white/40 mt-1"')
c = c.replace('w-12 h-12 bg-blue-50 rounded-lg',   'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-12 h-12 bg-green-50 rounded-lg',  'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-12 h-12 bg-purple-50 rounded-lg', 'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-12 h-12 bg-yellow-50 rounded-lg', 'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-6 h-6 text-blue-600',   'w-6 h-6 text-[rgb(255,240,120)]')
c = c.replace('w-6 h-6 text-green-600',  'w-6 h-6 text-green-400')
c = c.replace('w-6 h-6 text-purple-600', 'w-6 h-6 text-purple-400')
c = c.replace('w-6 h-6 text-yellow-600', 'w-6 h-6 text-[rgb(255,240,120)]')

# ── Overview stat cards ───────────────────────────────────────────────────────────
c = c.replace('bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200',
              'bg-black rounded-xl p-4 lg:p-6 border border-white/10')
c = c.replace('"bg-blue-50"',   '"bg-white/10"')
c = c.replace('"bg-green-50"',  '"bg-white/10"')
c = c.replace('"bg-purple-50"', '"bg-white/10"')
c = c.replace('"bg-yellow-50"', '"bg-white/10"')
c = c.replace('"text-blue-600"',   '"text-[rgb(255,240,120)]"')
c = c.replace('"text-green-600"',  '"text-green-400"')
c = c.replace('"text-purple-600"', '"text-purple-400"')
c = c.replace('"text-yellow-600"', '"text-[rgb(255,240,120)]"')
c = c.replace('"text-gray-500 text-xs lg:text-sm font-medium"',
              '"text-white/40 text-xs lg:text-sm font-medium"')
c = c.replace('"text-lg lg:text-2xl font-bold text-gray-900 mt-1 lg:mt-2 truncate"',
              '"text-lg lg:text-2xl font-bold text-[rgb(255,240,120)] mt-1 lg:mt-2 truncate"')
c = c.replace('"text-xs text-gray-500 mt-1"', '"text-xs text-white/40 mt-1"')

# ── "Deposits by Coin" section heading + icon ────────────────────────────────────
# Replace all "text-lg font-semibold text-gray-900" → yellow (table h3 + this heading)
# Then post-fix "Deposits by Coin" back to text-black
c = c.replace('"text-lg font-semibold text-gray-900"', '"text-lg font-semibold text-[rgb(255,240,120)]"')
c = c.replace('w-4 h-4 text-blue-500', 'w-4 h-4 text-[rgb(255,240,120)]')
c = c.replace('"text-sm text-gray-500"', '"text-sm text-white/40"')

# ── Coin performance cards ────────────────────────────────────────────────────────
c = c.replace(
    'bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer',
    'bg-black rounded-lg p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer'
)
c = c.replace('w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center',
              'w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center')
c = c.replace('"font-bold text-gray-900 text-base lg:text-lg"', '"font-bold text-white text-base lg:text-lg"')
c = c.replace('text-xs text-gray-500"', 'text-xs text-white/40"')
c = c.replace('w-4 h-4 text-gray-400"', 'w-4 h-4 text-white/40"')
c = c.replace('text-xs text-gray-500 mb-1', 'text-xs text-white/40 mb-1')
c = c.replace('"font-semibold text-blue-600 text-sm lg:text-base"',
              '"font-semibold text-[rgb(255,240,120)] text-sm lg:text-base"')
c = c.replace('"font-semibold text-green-600 text-sm lg:text-base"',
              '"font-semibold text-green-400 text-sm lg:text-base"')
c = c.replace('border-t border-gray-100', 'border-t border-white/10')
# "Users" and "Value" counts in coin perf card (no color — add explicitly)
c = c.replace(
    '<p className="font-medium text-sm">{coin.uniqueUsers.size}</p>',
    '<p className="font-medium text-sm text-white">{coin.uniqueUsers.size}</p>'
)
c = c.replace(
    '<p className="font-medium text-sm">{formatUSD(coin.totalValueUSD)}</p>',
    '<p className="font-medium text-sm text-[rgb(255,240,120)]">{formatUSD(coin.totalValueUSD)}</p>'
)

# ── Table container ───────────────────────────────────────────────────────────────
c = c.replace('bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
              'bg-black rounded-xl border border-white/10 overflow-hidden')
c = c.replace('border-b border-gray-200', 'border-b border-white/10')
c = c.replace('border-t border-gray-200', 'border-t border-white/10')
c = c.replace('"text-sm text-gray-500 mt-1"', '"text-sm text-white/40 mt-1"')

# ── View mode toggle (All / Coin View) ───────────────────────────────────────────
c = c.replace('flex items-center bg-gray-100 rounded-lg', 'flex items-center bg-white/10 rounded-lg')
c = c.replace("? 'bg-white border border-gray-300 shadow-sm'",
              "? 'bg-white/20 border border-[rgb(255,240,120)] text-[rgb(255,240,120)]'")
c = c.replace(": 'hover:bg-gray-200'", ": 'text-white/60 hover:bg-white/10'")

# ── Loading ───────────────────────────────────────────────────────────────────────
c = c.replace('border-b-2 border-blue-600', 'border-b-2 border-[rgb(255,240,120)]')
c = c.replace('mt-4 text-gray-600', 'mt-4 text-white/40')

# ── Empty state ───────────────────────────────────────────────────────────────────
c = c.replace('w-16 h-16 text-gray-300 mx-auto', 'w-16 h-16 text-white/20 mx-auto')
c = c.replace('mt-4 text-gray-600 text-lg', 'mt-4 text-white/40 text-lg')
c = c.replace('mt-2 text-blue-600 hover:text-blue-800', 'mt-2 text-[rgb(255,240,120)] hover:opacity-80')

# ── Desktop table ─────────────────────────────────────────────────────────────────
c = c.replace('"bg-gray-50 border-b border-gray-200"', '"bg-white/5 border-b border-white/10"')
c = c.replace('text-xs font-semibold text-gray-600 uppercase tracking-wider',
              'text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider')
c = c.replace('"divide-y divide-gray-200"', '"divide-y divide-white/5"')
c = c.replace('"hover:bg-gray-50 transition-colors cursor-pointer"',
              '"hover:bg-white/5 transition-colors cursor-pointer"')
c = c.replace('w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center',
              'w-8 h-8 rounded-full bg-white/10 flex items-center justify-center')
c = c.replace('"font-medium text-gray-900"', '"font-medium text-white"')
c = c.replace('"text-xs text-gray-500"', '"text-xs text-white/40"')
c = c.replace('"text-sm text-gray-900"', '"text-sm text-white"')
c = c.replace('"text-xs text-gray-500 truncate max-w-[120px]"',
              '"text-xs text-white/40 truncate max-w-[120px]"')
c = c.replace('"font-medium text-green-600"', '"font-medium text-green-400"')
c = c.replace('bg-green-100 text-green-800', 'bg-green-500/20 text-green-400')
c = c.replace(
    '"px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-medium"',
    '"px-3 py-1 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-md text-sm font-medium"'
)

# ── Mobile cards ──────────────────────────────────────────────────────────────────
c = c.replace('"p-4 hover:bg-gray-50 transition-colors cursor-pointer"',
              '"p-4 hover:bg-white/5 transition-colors cursor-pointer"')
c = c.replace('w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center',
              'w-10 h-10 rounded-full bg-white/10 flex items-center justify-center')
c = c.replace('"font-bold text-gray-900"', '"font-bold text-white"')
c = c.replace('"text-xs font-mono text-gray-700 truncate"', '"text-xs font-mono text-white/60 truncate"')
c = c.replace('"text-blue-600 hover:text-blue-800"', '"text-[rgb(255,240,120)] hover:opacity-80"')
c = c.replace(
    '"w-full mt-3 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium"',
    '"w-full mt-3 px-4 py-2 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-lg text-sm font-medium"'
)

# ── Pagination ────────────────────────────────────────────────────────────────────
c = c.replace('"text-sm text-gray-700"', '"text-sm text-white/60"')
c = c.replace(
    'px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50',
    'px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20'
)
# Pagination active/inactive (30-space indent — unique to pagination)
c = c.replace(
    "? 'bg-blue-600 text-white'\n                              : 'bg-white border border-gray-300 hover:bg-gray-50'",
    "? 'bg-[rgb(255,240,120)] text-black font-bold'\n                              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'"
)

# ── Info footer ───────────────────────────────────────────────────────────────────
c = c.replace('bg-gray-50 rounded-lg border border-gray-200', 'bg-black rounded-lg border border-white/10')
c = c.replace('"text-sm text-gray-600 mt-1"', '"text-sm text-white/60 mt-1"')
c = c.replace('"text-sm text-gray-600"', '"text-sm text-white/60"')
c = c.replace('"text-sm text-blue-600 hover:text-blue-800 font-medium"',
              '"text-sm text-[rgb(255,240,120)] hover:opacity-80 font-medium"')

# ── XRP icon fix (text-black inside dark container) ──────────────────────────────
c = c.replace('SiRipple className="text-black text-xl"', 'SiRipple className="text-white/70 text-xl"')

# ── Catch-all remaining gray/blue ────────────────────────────────────────────────
c = c.replace('text-gray-900', 'text-white')
c = c.replace('text-gray-500', 'text-white/40')
c = c.replace('text-gray-600', 'text-black/60')
c = c.replace('text-gray-400', 'text-white/40')
c = c.replace('text-gray-700', 'text-white/60')
c = c.replace('text-blue-600', 'text-[rgb(255,240,120)]')

# ── Post-fixes ────────────────────────────────────────────────────────────────────
# "Deposits by Coin" h3 is on yellow bg → text-black (not yellow)
c = c.replace(
    '<h3 className="text-lg font-semibold text-[rgb(255,240,120)]">Deposits by Coin</h3>',
    '<h3 className="text-lg font-semibold text-black">Deposits by Coin</h3>'
)
# Info footer h4 is inside black card → yellow heading
c = c.replace(
    '<h4 className="font-medium text-white">Coin Deposits Information</h4>',
    '<h4 className="font-medium text-[rgb(255,240,120)]">Coin Deposits Information</h4>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("CoinDeposits.jsx themed!")
