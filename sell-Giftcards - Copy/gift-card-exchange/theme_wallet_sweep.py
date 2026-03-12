path = r"c:/Users/Hp/OneDrive/Desktop/sell-Giftcards - Copy/gift-card-exchange/src/components/AdminWalletSweep.jsx"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# ── Loading text (on yellow bg) ──────────────────────────────────────────────────
c = c.replace('<p className="text-gray-600">Loading Wallet Sweep Data...</p>',
              '<p className="text-black/60">Loading Wallet Sweep Data...</p>')

# ── Header buttons ────────────────────────────────────────────────────────────────
c = c.replace('className="text-blue-500" />\n          Wallet Sweep Monitor',
              'className="text-[rgb(255,240,120)]" />\n          Wallet Sweep Monitor')
c = c.replace(
    'className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"',
    'className="bg-white/10 hover:bg-white/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg flex items-center gap-2"'
)
c = c.replace(
    'className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"',
    'className="bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"'
)

# ── Stat cards ────────────────────────────────────────────────────────────────────
c = c.replace('className="bg-white rounded-xl shadow-sm p-5"',
              'className="bg-black rounded-xl p-5 border border-white/10"')
c = c.replace('<p className="text-sm text-gray-500">Total Wallets</p>',
              '<p className="text-sm text-white/40">Total Wallets</p>')
c = c.replace('<p className="text-sm text-gray-500">Pending Sweep</p>',
              '<p className="text-sm text-white/40">Pending Sweep</p>')
c = c.replace('<p className="text-sm text-gray-500">Successfully Swept</p>',
              '<p className="text-sm text-white/40">Successfully Swept</p>')
c = c.replace('<p className="text-sm text-gray-500">Failed Sweeps</p>',
              '<p className="text-sm text-white/40">Failed Sweeps</p>')
c = c.replace('<p className="text-2xl font-bold text-gray-800">{sweepStats.totalWallets}</p>',
              '<p className="text-2xl font-bold text-[rgb(255,240,120)]">{sweepStats.totalWallets}</p>')
c = c.replace('<p className="text-2xl font-bold text-yellow-600">{sweepStats.pendingWallets}</p>',
              '<p className="text-2xl font-bold text-yellow-400">{sweepStats.pendingWallets}</p>')
c = c.replace('<p className="text-2xl font-bold text-green-600">{sweepStats.sweptWallets}</p>',
              '<p className="text-2xl font-bold text-green-400">{sweepStats.sweptWallets}</p>')
c = c.replace('<p className="text-2xl font-bold text-red-600">{sweepStats.failedWallets}</p>',
              '<p className="text-2xl font-bold text-red-400">{sweepStats.failedWallets}</p>')
c = c.replace('className="text-xs text-gray-500 mt-1">\n            With Balance:',
              'className="text-xs text-white/40 mt-1">\n            With Balance:')
c = c.replace('className="text-xs text-gray-500 mt-1">\n            Amount: {formatBalance(sweepStats.pendingAmount)',
              'className="text-xs text-white/40 mt-1">\n            Amount: {formatBalance(sweepStats.pendingAmount)')
c = c.replace('className="text-xs text-gray-500 mt-1">\n            Amount: {formatBalance(sweepStats.sweptAmount)',
              'className="text-xs text-white/40 mt-1">\n            Amount: {formatBalance(sweepStats.sweptAmount)')
c = c.replace('className="text-xs text-gray-500 mt-1">\n            Amount: {formatBalance(sweepStats.failedAmount)',
              'className="text-xs text-white/40 mt-1">\n            Amount: {formatBalance(sweepStats.failedAmount)')

# ── Balance gradient cards → black ────────────────────────────────────────────────
c = c.replace('bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white',
              'bg-black rounded-xl border border-[rgb(255,240,120)]/20 p-6')
c = c.replace('bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white',
              'bg-black rounded-xl border border-green-500/20 p-6')
c = c.replace('<p className="text-blue-100 text-sm">Total Crypto Balance</p>',
              '<p className="text-white/60 text-sm">Total Crypto Balance</p>')
c = c.replace('<p className="text-green-100 text-sm">Total USD Value</p>',
              '<p className="text-white/60 text-sm">Total USD Value</p>')
c = c.replace('<p className="text-3xl font-bold">{formatBalance(sweepStats.totalBalance)}</p>',
              '<p className="text-3xl font-bold text-[rgb(255,240,120)]">{formatBalance(sweepStats.totalBalance)}</p>')
c = c.replace('<p className="text-3xl font-bold">{formatUSD(sweepStats.totalBalanceUSD)}</p>',
              '<p className="text-3xl font-bold text-green-400">{formatUSD(sweepStats.totalBalanceUSD)}</p>')
c = c.replace('className="text-4xl text-blue-200"', 'className="text-4xl text-[rgb(255,240,120)]"')
c = c.replace('className="text-4xl text-green-200"', 'className="text-4xl text-green-400"')

# ── getSweepStatusBadge function ──────────────────────────────────────────────────
c = c.replace('text-xs font-medium bg-gray-100 text-gray-700',
              'text-xs font-medium bg-white/10 text-white/60')
c = c.replace('text-xs font-medium bg-green-100 text-green-700',
              'text-xs font-medium bg-green-500/20 text-green-400')
c = c.replace('text-xs font-medium bg-red-100 text-red-700',
              'text-xs font-medium bg-red-500/20 text-red-400')
c = c.replace('text-xs font-medium bg-yellow-100 text-yellow-700',
              'text-xs font-medium bg-yellow-500/20 text-yellow-400')

# ── Filter panel inputs ───────────────────────────────────────────────────────────
c = c.replace('className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"',
              'className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"')
c = c.replace(
    'className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"',
    'className="w-full pl-10 pr-4 py-2 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"'
)
c = c.replace(
    'className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"',
    'className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:border-[rgb(255,240,120)]"'
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
c = c.replace('<div className="flex items-center gap-2 font-medium">',
              '<div className="flex items-center gap-2 font-medium text-white">')
# Address
c = c.replace('className="font-mono text-sm text-gray-600" title={wallet.address}',
              'className="font-mono text-sm text-white/60" title={wallet.address}')
c = c.replace('className="text-gray-400 hover:text-gray-600"',
              'className="text-white/40 hover:text-white/70"')
# User col
c = c.replace('className="text-gray-400" />\n                        <span className="text-sm font-medium text-gray-700">',
              'className="text-white/40" />\n                        <span className="text-sm font-medium text-white">')
# Balance ternary
c = c.replace("wallet.balance > 0 ? 'text-green-600' : 'text-gray-600'",
              "wallet.balance > 0 ? 'text-green-400' : 'text-white/40'")
# USD
c = c.replace('className="px-6 py-4 font-medium text-blue-600"',
              'className="px-6 py-4 font-medium text-[rgb(255,240,120)]"')
# Tx hash
c = c.replace('className="font-mono text-xs text-gray-600"',
              'className="font-mono text-xs text-white/60"')
c = c.replace('className="text-blue-500 hover:text-blue-700 text-xs"',
              'className="text-[rgb(255,240,120)] hover:opacity-80 text-xs"')
c = c.replace('className="text-gray-400 text-sm"', 'className="text-white/40 text-sm"')
# Network badge
c = c.replace("? 'bg-blue-100 text-blue-700'\n                        : 'bg-orange-100 text-orange-700'",
              "? 'bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)]'\n                        : 'bg-orange-500/20 text-orange-400'")
# Date col
c = c.replace('className="px-6 py-4 text-sm text-gray-600">',
              'className="px-6 py-4 text-sm text-white/60">')
# Action buttons
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-[rgb(255,240,120)] transition-colors"')
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-500 transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"')

# ── Empty state ───────────────────────────────────────────────────────────────────
c = c.replace('className="text-5xl text-gray-300 mx-auto mb-4" />\n            <p className="text-gray-500">No wallets found',
              'className="text-5xl text-white/20 mx-auto mb-4" />\n            <p className="text-white/40">No wallets found')

# ── Modal ─────────────────────────────────────────────────────────────────────────
c = c.replace('className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"',
              'className="bg-[rgb(18,18,18)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"')
c = c.replace('className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"',
              'className="sticky top-0 bg-[rgb(18,18,18)] border-b border-white/10 px-6 py-4 flex justify-between items-center"')
c = c.replace('className="text-xl font-bold text-gray-800">Wallet Sweep Details',
              'className="text-xl font-bold text-[rgb(255,240,120)]">Wallet Sweep Details')
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"')
c = c.replace('className="text-sm text-gray-500"', 'className="text-sm text-white/40"')
# Coin flex in modal
c = c.replace('className="font-semibold flex items-center gap-2 mt-1"',
              'className="font-semibold flex items-center gap-2 mt-1 text-white"')
# Balance ternary in modal
c = c.replace("selectedWallet.balance > 0 ? 'text-green-600' : 'text-gray-600'",
              "selectedWallet.balance > 0 ? 'text-green-400' : 'text-white/40'")
# User section
c = c.replace('className="text-gray-400" />\n                  <p className="font-medium">{getUserDisplay',
              'className="text-white/40" />\n                  <p className="font-medium text-white">{getUserDisplay')
c = c.replace('className="text-xs text-gray-500 mt-1">ID: {selectedWallet.userId}',
              'className="text-xs text-white/40 mt-1">ID: {selectedWallet.userId}')
# Code blocks
c = c.replace('className="flex-1 p-2 bg-gray-50 rounded-lg font-mono text-sm break-all"',
              'className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80"')
# Tx hash view button in modal
c = c.replace('className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"',
              'className="px-3 py-2 bg-[rgb(255,240,120)] text-black rounded-lg hover:opacity-90 text-sm font-medium"')
# Error box in modal
c = c.replace('className="mt-1 p-3 bg-red-50 text-red-600 rounded-lg text-sm whitespace-pre-wrap"',
              'className="mt-1 p-3 bg-red-900/20 text-red-400 rounded-lg text-sm whitespace-pre-wrap"')
# Network badge in modal
c = c.replace("? 'bg-blue-100 text-blue-700'\n                      : 'bg-orange-100 text-orange-700'",
              "? 'bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)]'\n                      : 'bg-orange-500/20 text-orange-400'")
# Date values in modal
c = c.replace('className="text-sm mt-1">{formatDate(selectedWallet.createdAt)',
              'className="text-sm mt-1 text-white/80">{formatDate(selectedWallet.createdAt)')
c = c.replace('className="text-sm mt-1">{formatDate(selectedWallet.sweepCompletedAt)',
              'className="text-sm mt-1 text-white/80">{formatDate(selectedWallet.sweepCompletedAt)')
# Modal footer
c = c.replace('className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-wrap gap-3"',
              'className="sticky bottom-0 bg-[rgb(18,18,18)] border-t border-white/10 px-6 py-4 flex flex-wrap gap-3"')
c = c.replace('className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"',
              'className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 px-4 py-2 rounded-lg transition-colors"')
c = c.replace('className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"',
              'className="flex-1 bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"')

# ── Catch-all ─────────────────────────────────────────────────────────────────────
c = c.replace('text-gray-800', 'text-white')
c = c.replace('text-gray-600', 'text-white/60')
c = c.replace('text-gray-500', 'text-white/40')
c = c.replace('text-gray-400', 'text-white/30')
c = c.replace('text-gray-300', 'text-white/20')
c = c.replace('bg-gray-50',  'bg-white/5')
c = c.replace('bg-gray-100', 'bg-white/10')
c = c.replace('border-gray-200', 'border-white/10')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("AdminWalletSweep.jsx themed!")
