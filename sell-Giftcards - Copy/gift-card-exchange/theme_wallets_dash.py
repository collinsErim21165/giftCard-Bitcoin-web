path = r"c:/Users/Hp/OneDrive/Desktop/sell-Giftcards - Copy/gift-card-exchange/src/components/AdminWalletsDashboard.jsx"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# ── Loading text (on yellow bg) ──────────────────────────────────────────────────
c = c.replace('<p className="text-gray-600">Loading Wallet Administrator...</p>',
              '<p className="text-black/60">Loading Wallet Administrator...</p>')

# ── Backend error card ────────────────────────────────────────────────────────────
c = c.replace('className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md"',
              'className="text-center bg-black p-8 rounded-xl border border-white/10 max-w-md"')
c = c.replace('className="text-2xl font-bold text-gray-800 mb-2">Backend Not Reachable',
              'className="text-2xl font-bold text-[rgb(255,240,120)] mb-2">Backend Not Reachable')
c = c.replace('className="text-gray-600 mb-4">Cannot connect',
              'className="text-white/60 mb-4">Cannot connect')
c = c.replace('className="text-sm text-gray-500 mb-6">Make sure',
              'className="text-sm text-white/40 mb-6">Make sure')
c = c.replace('className="bg-gray-100 px-2 py-1 rounded">npm run server',
              'className="bg-white/10 px-2 py-1 rounded text-white/80">npm run server')

# ── Header icon + buttons ─────────────────────────────────────────────────────────
c = c.replace('className="text-blue-500" />\n          Wallet Administration',
              'className="text-[rgb(255,240,120)]" />\n          Wallet Administration')
c = c.replace(
    'className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"',
    'className="bg-white/10 hover:bg-white/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg text-sm"'
)
c = c.replace(
    'className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"',
    'className="bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium"'
)

# ── Stat cards ────────────────────────────────────────────────────────────────────
c = c.replace('className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"',
              'className="bg-black rounded-xl p-5 flex items-center gap-4 border border-white/10"')
c = c.replace('className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 text-xl"',
              'className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-[rgb(255,240,120)] text-xl"')
c = c.replace('className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-500 text-xl"',
              'className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-green-400 text-xl"')
c = c.replace('className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500 text-xl"',
              'className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-red-400 text-xl"')
c = c.replace('className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 text-xl"',
              'className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-purple-400 text-xl"')
c = c.replace('<p className="text-sm text-gray-500">Total Wallets</p>',
              '<p className="text-sm text-white/40">Total Wallets</p>')
c = c.replace('<p className="text-sm text-gray-500">Active Wallets</p>',
              '<p className="text-sm text-white/40">Active Wallets</p>')
c = c.replace('<p className="text-sm text-gray-500">Inactive Wallets</p>',
              '<p className="text-sm text-white/40">Inactive Wallets</p>')
c = c.replace('<p className="text-sm text-gray-500">Users with Wallets</p>',
              '<p className="text-sm text-white/40">Users with Wallets</p>')
c = c.replace('<p className="text-2xl font-bold text-gray-800">{calculatedStats.totalWallets}</p>',
              '<p className="text-2xl font-bold text-[rgb(255,240,120)]">{calculatedStats.totalWallets}</p>')
c = c.replace('<p className="text-2xl font-bold text-green-600">{calculatedStats.activeWallets}</p>',
              '<p className="text-2xl font-bold text-green-400">{calculatedStats.activeWallets}</p>')
c = c.replace('<p className="text-2xl font-bold text-red-600">{calculatedStats.inactiveWallets}</p>',
              '<p className="text-2xl font-bold text-red-400">{calculatedStats.inactiveWallets}</p>')
c = c.replace('<p className="text-2xl font-bold text-gray-800">{usersWithWallets}</p>',
              '<p className="text-2xl font-bold text-[rgb(255,240,120)]">{usersWithWallets}</p>')
c = c.replace('text-xs text-gray-500">Balance:', 'text-xs text-white/40">Balance:')
c = c.replace('"text-green-600 pl-4 text-base"', '"text-green-400 pl-4 text-base"')
c = c.replace('"text-red-600 pl-4 text-base"',   '"text-red-400 pl-4 text-base"')
c = c.replace('<p className="text-xs text-gray-500">Have at least one wallet</p>',
              '<p className="text-xs text-white/40">Have at least one wallet</p>')

# ── Balance gradient cards → black ────────────────────────────────────────────────
c = c.replace('bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white',
              'bg-black rounded-xl border border-[rgb(255,240,120)]/20 p-6')
c = c.replace('bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white',
              'bg-black rounded-xl border border-green-500/20 p-6')
c = c.replace('<p className="text-blue-100 text-sm">Total Crypto Balance</p>',
              '<p className="text-white/60 text-sm">Total Crypto Balance</p>')
c = c.replace('<p className="text-green-100 text-sm">Total USD Value</p>',
              '<p className="text-white/60 text-sm">Total USD Value</p>')
c = c.replace('<p className="text-3xl font-bold">{formatTotalBalance(calculatedStats.totalBalance)}</p>',
              '<p className="text-3xl font-bold text-[rgb(255,240,120)]">{formatTotalBalance(calculatedStats.totalBalance)}</p>')
c = c.replace('<p className="text-3xl font-bold">{formatUSD(calculatedStats.totalBalanceUSD)}</p>',
              '<p className="text-3xl font-bold text-green-400">{formatUSD(calculatedStats.totalBalanceUSD)}</p>')
c = c.replace('className="text-4xl text-blue-200"', 'className="text-4xl text-[rgb(255,240,120)]"')
c = c.replace('className="text-4xl text-green-200"', 'className="text-4xl text-green-400"')

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
c = c.replace('className="px-6 py-4 font-mono text-sm text-gray-600" title={wallet.address}',
              'className="px-6 py-4 font-mono text-sm text-white/60" title={wallet.address}')
# Balance ternary
c = c.replace("wallet.balance > 0 ? 'text-green-600' : 'text-gray-606'",
              "wallet.balance > 0 ? 'text-green-400' : 'text-white/40'")
c = c.replace("wallet.balance > 0 ? 'text-green-600' : 'text-gray-600'",
              "wallet.balance > 0 ? 'text-green-400' : 'text-white/40'")
# USD column
c = c.replace('className="px-6 py-4 font-medium text-blue-600"',
              'className="px-6 py-4 font-medium text-[rgb(255,240,120)]"')
# Status badges
c = c.replace("? 'bg-green-100 text-green-700'\n                          : 'bg-red-100 text-red-700'",
              "? 'bg-green-500/20 text-green-400'\n                          : 'bg-red-500/20 text-red-400'")
# User col
c = c.replace('className="text-gray-400" />\n                        <span className="text-sm font-medium text-gray-700">',
              'className="text-white/40" />\n                        <span className="text-sm font-medium text-white">')
# Network badge
c = c.replace("? 'bg-blue-100 text-blue-700'\n                          : 'bg-orange-100 text-orange-700'",
              "? 'bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)]'\n                          : 'bg-orange-500/20 text-orange-400'")
# Date col
c = c.replace('className="px-6 py-4 text-sm text-gray-600">',
              'className="px-6 py-4 text-sm text-white/60">')
# Action buttons
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-500 transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-[rgb(255,240,120)] transition-colors"')
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-500 transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-green-400 transition-colors"')
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-500 transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-400 transition-colors"')

# ── Empty state ───────────────────────────────────────────────────────────────────
c = c.replace('className="text-5xl text-gray-300 mx-auto mb-4" />\n            <p className="text-gray-500">No wallets found',
              'className="text-5xl text-white/20 mx-auto mb-4" />\n            <p className="text-white/40">No wallets found')

# ── Modal ─────────────────────────────────────────────────────────────────────────
c = c.replace('className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"',
              'className="bg-[rgb(18,18,18)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"')
c = c.replace('className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center"',
              'className="sticky top-0 bg-[rgb(18,18,18)] border-b border-white/10 px-6 py-4 flex justify-between items-center"')
c = c.replace('className="text-xl font-bold text-gray-800">Wallet Details',
              'className="text-xl font-bold text-[rgb(255,240,120)]">Wallet Details')
c = c.replace('className="p-2 hover:bg-gray-100 rounded-lg transition-colors"',
              'className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"')
c = c.replace('className="text-sm text-gray-500"', 'className="text-sm text-white/40"')
# Coin flex in modal
c = c.replace('className="font-semibold flex items-center gap-2 mt-1"',
              'className="font-semibold flex items-center gap-2 mt-1 text-white"')
# Balance in modal (ternary)
c = c.replace("selectedWallet.balance > 0 ? 'text-green-600' : 'text-gray-600'",
              "selectedWallet.balance > 0 ? 'text-green-400' : 'text-white/40'")
# USD in modal
c = c.replace('className="text-sm text-blue-600"', 'className="text-sm text-[rgb(255,240,120)]"')
# User section
c = c.replace('className="text-gray-400" />\n                  <p className="font-medium">\n                    {getUserDisplay',
              'className="text-white/40" />\n                  <p className="font-medium text-white">\n                    {getUserDisplay')
c = c.replace('className="text-xs text-gray-500 mt-1 font-mono"',
              'className="text-xs text-white/40 mt-1 font-mono"')
# Code blocks
c = c.replace('className="flex-1 p-2 bg-gray-50 rounded-lg font-mono text-sm break-all"',
              'className="flex-1 p-2 bg-white/10 rounded-lg font-mono text-sm break-all text-white/80"')
# Status badge in modal
c = c.replace("? 'bg-green-100 text-green-700'\n                        : 'bg-red-100 text-red-700'",
              "? 'bg-green-500/20 text-green-400'\n                        : 'bg-red-500/20 text-red-400'")
# Network badge in modal
c = c.replace("? 'bg-blue-100 text-blue-700'\n                        : 'bg-orange-100 text-orange-700'",
              "? 'bg-[rgb(255,240,120)]/10 text-[rgb(255,240,120)]'\n                        : 'bg-orange-500/20 text-orange-400'")
# Date values in modal
c = c.replace('className="text-sm mt-1">{selectedWallet.createdAt',
              'className="text-sm mt-1 text-white/80">{selectedWallet.createdAt')
c = c.replace('className="text-sm mt-1">{new Date(selectedWallet.activatedAt',
              'className="text-sm mt-1 text-white/80">{new Date(selectedWallet.activatedAt')
c = c.replace('className="text-sm mt-1">{new Date(selectedWallet.deactivatedAt',
              'className="text-sm mt-1 text-white/80">{new Date(selectedWallet.deactivatedAt')
c = c.replace('className="text-sm mt-1">{new Date(selectedWallet.lastDepositAt',
              'className="text-sm mt-1 text-white/80">{new Date(selectedWallet.lastDepositAt')
# Modal footer
c = c.replace('className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3"',
              'className="sticky bottom-0 bg-[rgb(18,18,18)] border-t border-white/10 px-6 py-4 flex gap-3"')
c = c.replace('className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"',
              'className="flex-1 bg-[rgb(255,240,120)] hover:opacity-90 text-black px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"')
c = c.replace('className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"',
              'className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg flex items-center justify-center gap-2"')
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

print("AdminWalletsDashboard.jsx themed!")
