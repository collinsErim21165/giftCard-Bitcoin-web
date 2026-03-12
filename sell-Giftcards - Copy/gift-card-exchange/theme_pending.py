path = r"c:/Users/Hp/OneDrive/Desktop/sell-Giftcards - Copy/gift-card-exchange/src/components/PendingCoinsSold.jsx"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# ── COIN_ICONS colors ─────────────────────────────────────────────────────────
c = c.replace('"bg-orange-100 text-orange-600"', '"bg-white/10 text-orange-400"')
c = c.replace('"bg-indigo-100 text-indigo-600"', '"bg-white/10 text-indigo-400"')
c = c.replace('"bg-green-100 text-green-600"',   '"bg-white/10 text-green-400"')
c = c.replace('"bg-blue-100 text-blue-600"',     '"bg-white/10 text-blue-400"')
c = c.replace('"bg-red-100 text-red-600"',       '"bg-white/10 text-red-400"')
c = c.replace('"bg-cyan-100 text-cyan-600"',     '"bg-white/10 text-cyan-400"')
c = c.replace('"bg-gray-100 text-gray-600"',     '"bg-white/10 text-white/70"')
c = c.replace('"bg-yellow-100 text-yellow-600"', '"bg-white/10 text-yellow-400"')
c = c.replace('"bg-gray-800 text-gray-100"',     '"bg-white/10 text-white"')
c = c.replace('"bg-yellow-50 text-yellow-500"',  '"bg-white/10 text-yellow-400"')

# ── getStatusBadgeColor function ──────────────────────────────────────────────
c = c.replace(
    "if (statusLower.includes('pending')) return 'bg-yellow-100 text-yellow-800';",
    "if (statusLower.includes('pending')) return 'bg-yellow-500/20 text-yellow-400';"
)
c = c.replace(
    "if (statusLower.includes('processing')) return 'bg-blue-100 text-blue-800';",
    "if (statusLower.includes('processing')) return 'bg-blue-500/20 text-blue-400';"
)
c = c.replace(
    "if (statusLower.includes('awaiting')) return 'bg-orange-100 text-orange-800';",
    "if (statusLower.includes('awaiting')) return 'bg-orange-500/20 text-orange-400';"
)
c = c.replace(
    "if (statusLower.includes('review')) return 'bg-purple-100 text-purple-800';",
    "if (statusLower.includes('review')) return 'bg-purple-500/20 text-purple-400';"
)
c = c.replace(
    "return 'bg-gray-100 text-gray-800';",
    "return 'bg-white/10 text-white/70';"
)

# ── Back button ───────────────────────────────────────────────────────────────
c = c.replace('text-black hover:text-blue-800 font-medium', 'text-black/60 hover:text-black font-medium')

# ── Page h1 + subtitle ───────────────────────────────────────────────────────
c = c.replace('text-2xl lg:text-3xl font-bold text-gray-900', 'text-2xl lg:text-3xl font-bold text-black')
c = c.replace('"text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base"', '"text-black/60 mt-1 lg:mt-2 text-sm lg:text-base"')

# ── Refresh button ────────────────────────────────────────────────────────────
c = c.replace(
    'bg-black text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2 text-sm lg:text-base',
    'bg-black text-[rgb(255,240,120)] rounded-lg hover:opacity-90 font-medium flex items-center gap-2 text-sm lg:text-base'
)

# ── Status summary badges ─────────────────────────────────────────────────────
c = c.replace('bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2',
              'bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2')
c = c.replace('bg-blue-50 border border-blue-200 rounded-lg px-4 py-2',
              'bg-white/10 border border-white/20 rounded-lg px-4 py-2')
c = c.replace('bg-orange-50 border border-orange-200 rounded-lg px-4 py-2',
              'bg-white/10 border border-white/20 rounded-lg px-4 py-2')
c = c.replace('text-yellow-600"', 'text-yellow-400"')
c = c.replace('text-yellow-700',  'text-yellow-400')
c = c.replace('text-blue-700',    'text-[rgb(255,240,120)]')
c = c.replace('text-orange-600"', 'text-orange-400"')
c = c.replace('text-orange-700',  'text-orange-400')

# ── Error box ─────────────────────────────────────────────────────────────────
c = c.replace('bg-red-50 border border-red-200 rounded-lg', 'bg-red-900/20 border border-red-500/30 rounded-lg')
c = c.replace('text-red-600 text-sm lg:text-base', 'text-red-400 text-sm lg:text-base')
c = c.replace('text-sm text-red-600 hover:text-red-800', 'text-sm text-red-400 hover:text-red-300')

# ── Search input ──────────────────────────────────────────────────────────────
c = c.replace(
    'bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base',
    'bg-black text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm lg:text-base'
)
c = c.replace('transform -translate-y-1/2 text-gray-400', 'transform -translate-y-1/2 text-white/40')

# ── Filter buttons ────────────────────────────────────────────────────────────
c = c.replace("? 'bg-black text-white'", "? 'bg-black text-[rgb(255,240,120)] border border-[rgb(255,240,120)]'")
c = c.replace(": 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'",
              ": 'bg-black/30 border border-black/20 text-black hover:bg-black/50'")
c = c.replace("|| 'bg-gray-100'}", "|| 'bg-white/10'}")

# ── Sort select + button ──────────────────────────────────────────────────────
c = c.replace(
    'px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
    'px-3 py-2 bg-black text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)] text-sm'
)
c = c.replace(
    'px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm',
    'px-3 py-2 bg-black text-white border border-white/20 rounded-lg hover:bg-white/10 flex items-center gap-2 focus:outline-none focus:border-[rgb(255,240,120)] text-sm'
)

# ── Bulk action bar ───────────────────────────────────────────────────────────
c = c.replace('bg-blue-50 border border-blue-200 rounded-lg', 'bg-white/10 border border-white/20 rounded-lg')
c = c.replace('text-blue-700 font-medium', 'text-[rgb(255,240,120)] font-medium')
c = c.replace('bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2',
              'bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 font-medium text-sm flex items-center gap-2')
c = c.replace('bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2',
              'bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 font-medium text-sm flex items-center gap-2')
c = c.replace('bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm',
              'bg-white/10 text-white/60 rounded-lg hover:bg-white/20 font-medium text-sm')

# ── Coin detail header (on yellow bg) ────────────────────────────────────────
c = c.replace('text-2xl font-bold text-gray-900', 'text-2xl font-bold text-black')
c = c.replace('"text-gray-600"', '"text-black/60"')

# ── coinDetail stat cards ─────────────────────────────────────────────────────
c = c.replace('bg-white rounded-xl p-6 shadow-sm border border-gray-200',
              'bg-black rounded-xl p-6 border border-white/10')
c = c.replace('w-12 h-12 bg-yellow-50 rounded-lg',  'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-12 h-12 bg-orange-50 rounded-lg',  'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-12 h-12 bg-blue-50 rounded-lg',    'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-12 h-12 bg-purple-50 rounded-lg',  'w-12 h-12 bg-white/10 rounded-lg')
c = c.replace('w-6 h-6 text-yellow-600', 'w-6 h-6 text-[rgb(255,240,120)]')
c = c.replace('w-6 h-6 text-orange-600', 'w-6 h-6 text-orange-400')
c = c.replace('w-6 h-6 text-blue-600',   'w-6 h-6 text-[rgb(255,240,120)]')
c = c.replace('w-6 h-6 text-purple-600', 'w-6 h-6 text-purple-400')

# ── Overview stat cards ───────────────────────────────────────────────────────
c = c.replace('bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200',
              'bg-black rounded-xl p-4 lg:p-6 border border-white/10')
c = c.replace('"bg-yellow-50"', '"bg-white/10"')
c = c.replace('"bg-blue-50"',   '"bg-white/10"')
c = c.replace('"bg-orange-50"', '"bg-white/10"')
c = c.replace('"bg-purple-50"', '"bg-white/10"')
c = c.replace('"text-yellow-600"', '"text-[rgb(255,240,120)]"')
c = c.replace('"text-blue-600"',   '"text-[rgb(255,240,120)]"')
c = c.replace('"text-orange-600"', '"text-orange-400"')
c = c.replace('"text-purple-600"', '"text-purple-400"')
c = c.replace('"text-gray-500 text-xs lg:text-sm font-medium"', '"text-white/40 text-xs lg:text-sm font-medium"')
c = c.replace('"text-lg lg:text-2xl font-bold text-gray-900 mt-1 lg:mt-2 truncate"',
              '"text-lg lg:text-2xl font-bold text-[rgb(255,240,120)] mt-1 lg:mt-2 truncate"')
c = c.replace('"text-xs text-gray-500 mt-1"', '"text-xs text-white/40 mt-1"')

# ── Coin performance section heading ──────────────────────────────────────────
c = c.replace('"text-lg font-semibold text-gray-900 mb-3 lg:mb-4"',
              '"text-lg font-semibold text-black mb-3 lg:mb-4"')

# ── Coin performance cards ────────────────────────────────────────────────────
c = c.replace('bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer',
              'bg-black rounded-lg p-3 lg:p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer')
c = c.replace('"font-bold text-gray-900 text-base lg:text-lg"',
              '"font-bold text-white text-base lg:text-lg"')
c = c.replace('text-xs text-gray-500"', 'text-xs text-white/40"')
c = c.replace('w-4 h-4 text-gray-400"', 'w-4 h-4 text-white/40"')
c = c.replace('text-xs text-gray-500 mb-1', 'text-xs text-white/40 mb-1')
c = c.replace('"font-semibold text-yellow-600 text-sm lg:text-base"',
              '"font-semibold text-[rgb(255,240,120)] text-sm lg:text-base"')
c = c.replace('"font-semibold text-orange-600 text-sm lg:text-base"',
              '"font-semibold text-green-400 text-sm lg:text-base"')
c = c.replace('border-t border-gray-100', 'border-t border-white/10')
c = c.replace('text-xs text-gray-500"', 'text-xs text-white/40"')
c = c.replace('"text-xs lg:text-sm font-medium"', '"text-xs lg:text-sm font-medium text-white"')
c = c.replace('"text-xs lg:text-sm font-medium text-purple-600"',
              '"text-xs lg:text-sm font-medium text-purple-400"')

# ── Table container ───────────────────────────────────────────────────────────
c = c.replace('bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
              'bg-black rounded-xl border border-white/10 overflow-hidden')
c = c.replace('border-b border-gray-200', 'border-b border-white/10')
c = c.replace('border-t border-gray-200', 'border-t border-white/10')

# ── Table h3 heading ─────────────────────────────────────────────────────────
c = c.replace('"text-lg font-semibold text-gray-900"',
              '"text-lg font-semibold text-[rgb(255,240,120)]"')

# ── Select All link ───────────────────────────────────────────────────────────
c = c.replace('"text-sm text-blue-600 hover:text-blue-800 font-medium"',
              '"text-sm text-[rgb(255,240,120)] hover:opacity-80 font-medium"')

# ── Last updated ──────────────────────────────────────────────────────────────
c = c.replace('"text-sm text-gray-500"', '"text-sm text-white/40"')

# ── Loading ───────────────────────────────────────────────────────────────────
c = c.replace('border-b-2 border-blue-600', 'border-b-2 border-[rgb(255,240,120)]')
c = c.replace('text-gray-500 mt-3 lg:mt-4', 'text-white/40 mt-3 lg:mt-4')

# ── Empty state ───────────────────────────────────────────────────────────────
c = c.replace('bg-gray-100 rounded-full', 'bg-white/10 rounded-full')
c = c.replace('text-gray-400"', 'text-white/40"')
c = c.replace('text-lg font-medium text-gray-900', 'text-lg font-medium text-white')
c = c.replace('text-gray-500 mt-1 text-sm lg:text-base', 'text-white/40 mt-1 text-sm lg:text-base')
c = c.replace('bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm lg:text-base',
              'bg-[rgb(255,240,120)] text-black rounded-lg hover:opacity-90 font-medium text-sm lg:text-base')

# ── Mobile card view ──────────────────────────────────────────────────────────
c = c.replace('divide-y divide-gray-200', 'divide-y divide-white/5')
c = c.replace('p-4 hover:bg-gray-50"', 'p-4 hover:bg-white/5"')
c = c.replace('"h-4 w-4 text-blue-600 rounded border-gray-300"',
              '"h-4 w-4 accent-[rgb(255,240,120)] rounded border-white/20"')
c = c.replace('"font-medium text-gray-900"', '"font-medium text-white"')
c = c.replace('"text-xs text-gray-500"', '"text-xs text-white/40"')
c = c.replace('"text-gray-500"', '"text-gray-500"')  # placeholder; handled below
c = c.replace('"font-semibold text-blue-600"', '"font-semibold text-[rgb(255,240,120)]"')
c = c.replace('"font-semibold text-green-600"', '"font-semibold text-green-400"')
c = c.replace('border-t border-gray-200"', 'border-t border-white/10"')
c = c.replace('"w-full px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium"',
              '"w-full px-4 py-2 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-lg text-sm font-medium"')

# ── Desktop table ─────────────────────────────────────────────────────────────
c = c.replace('"min-w-full divide-y divide-gray-200"', '"min-w-full divide-y divide-white/5"')
c = c.replace('"bg-gray-50"', '"bg-white/5"')
c = c.replace('text-xs font-medium text-gray-500 uppercase tracking-wider',
              'text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider')
c = c.replace('hover:bg-gray-50 transition-colors"', 'hover:bg-white/5 transition-colors"')
c = c.replace('"text-sm font-medium text-gray-900"', '"text-sm font-medium text-white"')
c = c.replace('"text-sm text-gray-900"', '"text-sm text-white"')
c = c.replace('"text-xs text-gray-500 truncate max-w-[120px]"', '"text-xs text-white/40 truncate max-w-[120px]"')
c = c.replace('"text-sm font-semibold text-blue-600"', '"text-sm font-semibold text-[rgb(255,240,120)]"')
c = c.replace('"text-sm font-semibold text-green-600"', '"text-sm font-semibold text-green-400"')
c = c.replace('"text-xs text-gray-500"\n                            >',
              '"text-xs text-white/40"\n                            >')
c = c.replace('"px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-medium"',
              '"px-3 py-1 bg-white/10 text-[rgb(255,240,120)] hover:bg-white/20 rounded-md text-sm font-medium"')

# ── Pagination ────────────────────────────────────────────────────────────────
c = c.replace("? 'bg-blue-600 text-white'", "? 'bg-[rgb(255,240,120)] text-black font-bold'")
c = c.replace(": 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'",
              ": 'bg-white/10 border border-white/20 text-white hover:bg-white/20'")
c = c.replace('px-3 py-1 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50',
              'px-3 py-1 bg-white/10 border border-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20')

# ── Info footer ───────────────────────────────────────────────────────────────
c = c.replace('bg-gray-50 rounded-lg border border-gray-200', 'bg-black rounded-lg border border-white/10')
c = c.replace('"font-medium text-gray-900"', '"font-medium text-[rgb(255,240,120)]"')
c = c.replace('"text-sm text-gray-600 mt-1"', '"text-sm text-white/60 mt-1"')
c = c.replace('"text-sm text-gray-600"', '"text-sm text-white/60"')

# ── coinDetail stat card values ───────────────────────────────────────────────
c = c.replace('"text-2xl font-bold text-gray-900 mt-2"',
              '"text-2xl font-bold text-[rgb(255,240,120)] mt-2"')
c = c.replace('"text-sm text-gray-500 mt-1"', '"text-sm text-white/40 mt-1"')
c = c.replace('"text-gray-500 text-sm font-medium"', '"text-white/40 text-sm font-medium"')

# ── catch-all remaining ───────────────────────────────────────────────────────
c = c.replace('text-gray-900', 'text-white')
c = c.replace('text-gray-500', 'text-white/40')
c = c.replace('text-gray-600', 'text-black/60')
c = c.replace('text-gray-400', 'text-white/40')
c = c.replace('text-blue-600', 'text-[rgb(255,240,120)]')

# ── Fix: "Pending by Coin" h3 caught by table heading rule → must stay black
c = c.replace(
    '<h3 className="text-lg font-semibold text-[rgb(255,240,120)] mb-3 lg:mb-4">Pending by Coin</h3>',
    '<h3 className="text-lg font-semibold text-black mb-3 lg:mb-4">Pending by Coin</h3>'
)

# ── Fix: coin detail h2 on yellow bg caught by catch-all → keep black
c = c.replace(
    '<h2 className="text-2xl font-bold text-white">Pending {selectedCoin} Sales</h2>',
    '<h2 className="text-2xl font-bold text-black">Pending {selectedCoin} Sales</h2>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("PendingCoinsSold.jsx themed!")
