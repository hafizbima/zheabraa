import { AuthProvider } from './AuthContext.jsx'
import { DataProvider } from './DataContext.jsx'
import { MonthProvider } from './MonthContext.jsx'

export function StoreProvider({ children }) {
  return (
    <AuthProvider>
      <DataProvider>
        <MonthProvider>
          {children}
        </MonthProvider>
      </DataProvider>
    </AuthProvider>
  )
}
