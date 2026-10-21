import { useAuth } from './AuthContext.jsx'
import { useData } from './DataContext.jsx'
import { useMonth } from './MonthContext.jsx'

export { StoreProvider } from './providers.jsx'

// backward-compatible hook — komponen tidak perlu diubah
export function useStore() {
  const auth = useAuth()
  const data = useData()
  const month = useMonth()
  return { ...auth, ...data, ...month }
}
