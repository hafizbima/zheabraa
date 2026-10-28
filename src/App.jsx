import { useState, lazy, Suspense } from 'react'
import { StoreProvider, useStore } from './store/StoreContext.jsx'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import TransactionList from './components/TransactionList.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import Login from './components/Login.jsx'

// Lazy load non-critical routes and modals to minimize initial bundle size
const Stats = lazy(() => import('./components/Stats.jsx'))
const Report = lazy(() => import('./components/Report.jsx'))
const CategoryManager = lazy(() => import('./components/CategoryManager.jsx'))
const BudgetTemplateManager = lazy(() => import('./components/BudgetTemplateManager.jsx'))
const WalletManager = lazy(() => import('./components/WalletManager.jsx'))
const RecurringManager = lazy(() => import('./components/RecurringManager.jsx'))
const TransferForm = lazy(() => import('./components/TransferForm.jsx'))
const IosInstallPrompt = lazy(() => import('./components/IosInstallPrompt.jsx'))

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
  const [budgetTemplateOpen, setBudgetTemplateOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [recurrOpen, setRecurrOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [installPromptOpen, setInstallPromptOpen] = useState(false)

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
        onOpenInstallPrompt={() => setInstallPromptOpen(true)}
      />

      <main className="mx-auto max-w-3xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600 dark:border-slate-800 dark:border-t-teal-400" />
            </div>
          }
        >
          {view === 'dashboard' ? (
            <Dashboard
              onNewTx={openNewTx}
              onEditTx={openEditTx}
              onManageCategories={() => setCatOpen(true)}
              onManageBudgetTemplates={() => setBudgetTemplateOpen(true)}
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
        </Suspense>
      </main>

      {/* FAB */}
      <button
        onClick={() => openNewTx(null)}
        className="no-print fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-tactile-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:bg-teal-600 dark:hover:bg-teal-500"
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
      <Suspense fallback={null}>
        {catOpen && <CategoryManager onClose={() => setCatOpen(false)} />}
        {budgetTemplateOpen && <BudgetTemplateManager onClose={() => setBudgetTemplateOpen(false)} />}
        {walletOpen && <WalletManager onClose={() => setWalletOpen(false)} />}
        {recurrOpen && <RecurringManager onClose={() => setRecurrOpen(false)} />}
        {transferOpen && <TransferForm monthId={currentMonthId} onClose={() => setTransferOpen(false)} />}

        <IosInstallPrompt
          open={installPromptOpen ? true : undefined}
          onClose={() => setInstallPromptOpen(false)}
        />
      </Suspense>

      {notice && (
        <div
          role="alert"
          onClick={() => notify('')}
          className="fixed left-1/2 top-4 z-[70] w-max max-w-[90vw] -translate-x-1/2 cursor-pointer rounded-full border-2 border-rose-500 bg-white px-4 py-2 text-sm font-medium text-rose-500 shadow-lg dark:border-rose-500 dark:bg-slate-900"
        >
          {notice}
        </div>
      )}
    </div>
  )
}
