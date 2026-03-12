path = r"c:/Users/Hp/OneDrive/Desktop/sell-Giftcards - Copy/gift-card-exchange/src/components/SuccessfulSweeps.jsx"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# ── Loading spinner text (on yellow bg) ──────────────────────────────────────────
c = c.replace('<p className="text-gray-600">Loading Successful Sweeps...</p>',
              '<p className="text-black/60">Loading Successful Sweeps...</p>')

# ── Header refresh button (inside bg-black header) ───────────────────────────────
c = c.replace(
    'className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"',
    'className="bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"'
)

# ── Stat cards ────────────────────────────────────────────────────────────────────
c = c.replace('className="bg-white rounded-xl shadow-sm p-5"',
              'className="bg-black rounded-xl p-5 border border-white/10"')
c = c.replace('<p className="text-sm text-gray-500">Total Successful Sweeps</p>',
              '<p className="text-sm text-white/40">Total Successful Sweeps</p>')
c = c.replace('<p className="text-sm text-gray-500">Total Amount Swept</p>',
              '<p className="text-sm text-white/40">Total Amount Swept</p>')
c = c.replace('<p className="text-sm text-gray-500">Unique Source Wallets</p>',
              '<p className="text-sm text-white/40">Unique Source Wallets</p>')
c = c.replace('<p className="text-sm text-gray-500">Largest Sweep</p>',
              '<p className="text-sm text-white/40">Largest Sweep</p>')
c = c.replace('className="text-2xl font-bold text-gray-800"',
              'className="text-2xl font-bold text-[rgb(255,240,120)]"')
c = c.replace('<p className="text-xs text-gray-500 mt-1">{formatUSD(sweepStats.totalAmountUSD)}</p>',
              '<p className="text-xs text-white/40 mt-1">{formatUSD(sweepStats.totalAmountUSD)}</p>')
c = c.replace('<p className="text-xs text-gray-500 mt-1">{formatUSD(sweepStats.largestSweepUSD)}</p>',
              '<p className="text-xs text-white/40 mt-1">{formatUSD(sweepStats.largestSweepUSD)}</p>')

# ── Filter inputs (inside bg-black panel) ────────────────────────────────────────
c = c.replace(
    'className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"',
    'className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"'
)
c = c.replace('className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"',
              'className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"')
c = c.replace(
    'className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"',
    'className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"',
)

# ── Table container ───────────────────────────────────────────────────────────────
c = c.replace('className="bg-white rounded-xl shadow-sm overflow-hidden"',
              'className="bg-black rounded-xl border border-white/10 overflow-hidden"')
c = c.replace('className="bg-gray-50 border-b border-gray-200"',
              'className="bg-white/5 border-b border-white/10"')
c = c.replace('className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"',
              'className="px-6 py-4 text-left text-xs font-bold text-[rgb(255,240,120)] uppercase tracking-wider"')
c = c.replace('className="divide-y divide-gray-200"', 'className="divide-y divide-white/5"')
c = c.replace('className="hover:bg-gray-50 transition-colors"',
              'className="hover:bg-white/5 transition-colors"')

# ── Table cells ───────────────────────────────────────────────────────────────────
# Coin name span (no color — inside hover:bg-white/5 row)
c = c.replace('<div className="flex items-center gap-2 font-medium">',
              '<div className="flex items-center gap-2 font-medium text-white">')
# Wallet addresses
c = c.replace('className="font-mono text-sm text-gray-600" title={sweep.sourceWallet}',
              'className="font-mono text-sm text-white/60" title={sweep.sourceWallet}')
c = c.replace('className="font-mono text-sm text-gray-600" title={sweep.destinationWallet}',
              'className="font-mono text-sm text-white/60" title={sweep.destinationWallet}')
# Copy buttons
c = c.replace('className="text-gray-400 hover:text-gray-600"',
              'className="text-white/40 hover:text-white/70"')
# User display
c = c.replace('className="font-medium text-gray-800"', 'className="font-medium text-white"')
c = c.replace('className="text-xs text-gray-500"', 'className="text-xs text-white/40"')
# Amount / USD
c = c.replace('className="px-6 py-4 font-medium text-green-600"',
              'className="px-6 py-4 font-medium text-green-400"')
c = c.replace('className="px-6 py-4 font-medium text-blue-600"',
              'className="px-6 py-4 font-medium text-[rgb(255,240,120)]"')
# Tx hash
c = c.replace('className="font-mono text-xs text-gray-600"',
              'className="font-mono text-xs text-white/60"')
c = c.replace('className="text-green-600 hover:text-green-800"',
              'className="text-green-400 hover:text-green-300"')
c = c.replace('className="text-gray-400 text-sm"', 'className="text-white/40 text-sm"')
# Date column
c = c.replace('className="px-6 py-4 text-sm text-gray-600"',
              'className="px-6 py-4 text-sm text-white/60"')
c = c.replace('className="text-xs text-gray-400"', 'className="text-xs text-white/30"')
# Actions eye button
c = c.replace(
    'className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-600 transition-colors"',
    'className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"'
)

# ── Empty state ───────────────────────────────────────────────────────────────────
c = c.replace('className="text-5xl text-gray-300 mx-auto mb-4"',
              'className="text-5xl text-white/20 mx-auto mb-4"')
c = c.replace('<p className="text-gray-500">No successful sweep transactions found</p>',
              '<p className="text-white/40">No successful sweep transactions found</p>')

# ── Modal ─────────────────────────────────────────────────────────────────────────
# Modal outer (white box → dark)
c = c.replace(
    'className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"',
    'className="bg-[rgb(18,18,18)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"'
)
# Modal header bar
c = c.replace(
    'className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"',
    'className="sticky top-0 bg-[rgb(18,18,18)] border-b border-white/10 px-6 py-4 flex justify-between items-center"'
)
# Modal title
c = c.replace('className="text-xl font-bold text-gray-800"',
              'className="text-xl font-bold text-[rgb(255,240,120)]"')
# Modal close button (X)
c = c.replace(
    'className="p-2 hover:bg-gray-100 rounded-lg transition-colors"',
    'className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"'
)
# Modal labels
c = c.replace('className="text-sm text-gray-500"', 'className="text-sm text-white/40"')
# Coin name in modal (flex div)
c = c.replace('className="flex items-center gap-2 mt-1 font-semibold"',
              'className="flex items-center gap-2 mt-1 font-semibold text-white"')
# Amount green in modal
c = c.replace('className="font-bold text-lg text-green-600"',
              'className="font-bold text-lg text-green-400"')
# USD in modal
c = c.replace('className="text-sm text-blue-600"',
              'className="text-sm text-[rgb(255,240,120)]"')
# Code blocks (wallet addresses in modal)
c = c.replace('className="flex-1 p-2 bg-gray-50 rounded-lg font-mono text-sm break-all"',
              'className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80"')
# User display in modal (no color — add text-white)
c = c.replace('<p className="font-medium mt-1">{getUserDisplay(selectedSweep.userId)}</p>',
              '<p className="font-medium mt-1 text-white">{getUserDisplay(selectedSweep.userId)}</p>')
c = c.replace('<p className="text-xs text-gray-500 mt-1">ID: {selectedSweep.userId}</p>',
              '<p className="text-xs text-white/40 mt-1">ID: {selectedSweep.userId}</p>')
# Wallet ID in modal (no color)
c = c.replace('<p className="text-sm mt-1 font-mono">{selectedSweep.walletId || \'N/A\'}</p>',
              '<p className="text-sm mt-1 font-mono text-white/70">{selectedSweep.walletId || \'N/A\'}</p>')
# Status badge
c = c.replace('className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"',
              'className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400"')
# Explorer button in modal
c = c.replace(
    'className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"',
    'className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm flex items-center gap-2"'
)
# Date values in modal (no color — add text-white/80)
c = c.replace('<p className="text-sm mt-1">{formatDate(selectedSweep.createdAt)}</p>',
              '<p className="text-sm mt-1 text-white/80">{formatDate(selectedSweep.createdAt)}</p>')
c = c.replace('<p className="text-sm mt-1">{formatDate(selectedSweep.completedAt)}</p>',
              '<p className="text-sm mt-1 text-white/80">{formatDate(selectedSweep.completedAt)}</p>')
# Modal footer
c = c.replace(
    'className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3"',
    'className="sticky bottom-0 bg-[rgb(18,18,18)] border-t border-white/10 px-6 py-4 flex gap-3"'
)
# Modal close button in footer
c = c.replace(
    'className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"',
    'className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 px-4 py-2 rounded-lg transition-colors"'
)

# ── Catch-all remaining gray ──────────────────────────────────────────────────────
c = c.replace('text-gray-800', 'text-white')
c = c.replace('text-gray-600', 'text-white/60')
c = c.replace('text-gray-500', 'text-white/40')
c = c.replace('text-gray-400', 'text-white/30')
c = c.replace('text-gray-300', 'text-white/20')
c = c.replace('bg-gray-50',  'bg-white/5')
c = c.replace('bg-gray-100', 'bg-white/10')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("SuccessfulSweeps.jsx themed!")
