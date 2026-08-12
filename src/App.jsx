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
      <div className="flex min-h-screen items-center justify-center bg-brand-700">
        <div className="text-center text-white">
          <img
            src="/logo.png"
            alt="Gimme Money"
            className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white/15 object-cover"
          />
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm text-brand-200">Memuat data…</p>
        </div>
      </div>
    )
  }
  if (!user) return <Login />
  return <Shell />
}

function Shell() {
  const { currentMonthId } = useStore()
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
    <div className="min-h-screen bg-brand-50 dark:bg-slate-950">
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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-lg shadow-brand-600/40 transition hover:from-brand-500 hover:to-brand-800 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
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
    </div>
  )
}
