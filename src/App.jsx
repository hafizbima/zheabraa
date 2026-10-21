import { useState } from 'react'
import { StoreProvider, useStore } from './store/StoreContext.jsx'
import Login from './components/Login.jsx'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import TransactionList from './components/TransactionList.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import Stats from './components/Stats.jsx'
import Report from './components/Report.jsx'
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
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] dark:bg-[#0D1117]">
        <div className="text-center text-slate-900 dark:text-white">
          <img
            src="/logo.png"
            alt="Gimme Money"
            className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-slate-200/80 object-cover shadow-tactile-sm dark:border-slate-800"
          />
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-800 dark:border-t-teal-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Memuat data…</p>
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
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 transition-colors duration-200 dark:bg-[#0D1117] dark:text-slate-100">
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
        ) : view === 'report' ? (
          <Report />
        ) : (
          <TransactionList onEditTx={openEditTx} />
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => openNewTx(null)}
        className="no-print fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-tactile-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:bg-teal-600 dark:hover:bg-teal-500"
        aria-label="Tambah transaksi"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
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
          className="fixed left-1/2 top-4 z-[70] w-max max-w-[90vw] -translate-x-1/2 cursor-pointer rounded-full border-2 border-ember bg-paper px-4 py-2 text-sm font-medium text-ember shadow-lg dark:border-ember dark:bg-slate-900"
        >
          {notice}
        </div>
      )}
    </div>
  )
}
