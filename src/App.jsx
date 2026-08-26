import { useState } from 'react'
import { StoreProvider, useStore } from './store/StoreContext.jsx'
import Login from './components/Login.jsx'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import TransactionList from './components/TransactionList.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import Stats from './components/Stats.jsx'
import CategoryManager from './components/CategoryManager.jsx'
import WalletManager from './components/WalletManager.jsx'
import RecurringManager from './components/RecurringManager.jsx'
import TransferForm from './components/TransferForm.jsx'

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  )
}

function Root() {
  const { user, ready } = useStore()
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky dark:bg-[#131a33]">
        <div className="text-center text-carbon dark:text-white">
          <img
            src="/logo.png"
            alt="Gimme Money"
            className="mx-auto mb-4 h-14 w-14 rounded-2xl border-2 border-carbon/20 object-cover"
          />
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-carbon/20 border-t-carbon dark:border-white/20 dark:border-t-white" />
          <p className="text-sm opacity-60">Memuat data…</p>
        </div>
      </div>
    )
  }
  if (!user) return <Login />
  return <Shell />
}

function Shell() {
  const { currentMonthId, notice, notify } = useStore()
  const [view, setView] = useState('dashboard')
  const [txOpen, setTxOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [prefill, setPrefill] = useState(null)
  const [catOpen, setCatOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [recurrOpen, setRecurrOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const openNewTx = (prefillData) => {
    setEditing(null)
    setPrefill(prefillData || null)
    setTxOpen(true)
  }

  const openEditTx = (monthId, tx) => {
    setEditing({ monthId, tx })
    setPrefill(null)
    setTxOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky via-sky to-[#cfe6ff] dark:from-[#131a33] dark:via-[#131a33] dark:to-[#0f1b3d]">
      <Header
        view={view}
        onViewChange={setView}
        onOpenWallets={() => setWalletOpen(true)}
      />

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5">
        {view === 'dashboard' ? (
          <Dashboard
            onNewTx={openNewTx}
            onEditTx={openEditTx}
            onManageCategories={() => setCatOpen(true)}
            onManageRecurring={() => setRecurrOpen(true)}
            onTransfer={() => setTransferOpen(true)}
          />
        ) : view === 'stats' ? (
          <Stats />
        ) : (
          <TransactionList onEditTx={openEditTx} />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => openNewTx(null)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-carbon bg-paper text-2xl text-carbon transition hover:bg-mist active:scale-95 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        aria-label="Tambah transaksi"
      >
        +
      </button>

      {txOpen && (
        <TransactionForm
          monthId={editing?.monthId || currentMonthId}
          transaction={editing?.tx}
          prefill={prefill}
          onClose={() => setTxOpen(false)}
        />
      )}
      {catOpen && <CategoryManager onClose={() => setCatOpen(false)} />}
      {walletOpen && <WalletManager onClose={() => setWalletOpen(false)} />}
      {recurrOpen && <RecurringManager onClose={() => setRecurrOpen(false)} />}
      {transferOpen && <TransferForm monthId={currentMonthId} onClose={() => setTransferOpen(false)} />}

      {notice && (
        <div
          role="alert"
          onClick={() => notify('')}
          className="fixed bottom-24 left-1/2 z-[60] w-max max-w-[90vw] -translate-x-1/2 cursor-pointer rounded-full border-2 border-ember bg-paper px-4 py-2 text-sm font-medium text-ember shadow-lg dark:border-ember dark:bg-slate-900"
        >
          {notice}
        </div>
      )}
    </div>
  )
}
