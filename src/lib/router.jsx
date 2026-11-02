import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

const ROUTE_TITLES = {
  '/': 'Zheabraa: Pocket Budgeting — Bagi Gajimu ke Pocket, Pantau Sisanya.',
  '/login': 'Masuk — Zheabraa Pocket Budgeting',
  '/register': 'Buat Akun — Zheabraa Pocket Budgeting',
  '/forgot-password': 'Reset Password — Zheabraa Pocket Budgeting',
  '/dashboard': 'Dashboard — Zheabraa Pocket Budgeting',
  '/privasi': 'Kebijakan Privasi — Zheabraa',
  '/syarat': 'Syarat Layanan — Zheabraa',
}

function cleanPath(pathname) {
  if (!pathname) return '/'
  const trimmed = pathname.split('?')[0].split('#')[0]
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1)
  }
  return trimmed || '/'
}

export function RouterProvider({ children }) {
  const [pathname, setPathname] = useState(() => {
    if (typeof window !== 'undefined') {
      return cleanPath(window.location.pathname)
    }
    return '/'
  })

  // Sinkronisasi dengan tombol back/forward browser
  useEffect(() => {
    const handlePopState = () => {
      setPathname(cleanPath(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((to, { replace = false, preserveScroll = false } = {}) => {
    if (typeof window === 'undefined') return
    
    // Tangani anchor hash pada halaman yang sama
    if (to.startsWith('#')) {
      const el = document.querySelector(to)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', to)
      }
      return
    }

    // Tangani path + hash (misal /#cara-kerja)
    const [pathPart, hashPart] = to.split('#')
    const targetPath = cleanPath(pathPart)
    const fullTarget = hashPart ? `${targetPath}#${hashPart}` : targetPath

    if (replace) {
      window.history.replaceState(null, '', fullTarget)
    } else {
      window.history.pushState(null, '', fullTarget)
    }
    
    setPathname(targetPath)

    if (hashPart) {
      setTimeout(() => {
        const el = document.getElementById(hashPart)
        if (el && typeof el.scrollIntoView === 'function') {
          try {
            el.scrollIntoView({ behavior: 'smooth' })
          } catch (e) {}
        }
      }, 50)
    } else if (!preserveScroll && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'instant' })
      } catch (e) {}
    }
  }, [])

  // Update dynamic document title & canonical link
  useEffect(() => {
    if (typeof document === 'undefined') return
    const title = ROUTE_TITLES[pathname] || 'Halaman Tidak Ditemukan — Zheabraa'
    document.title = title

    // Update canonical tag
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const origin = 'https://zheabraa.vercel.app'
    canonical.setAttribute('href', pathname === '/' ? `${origin}/` : `${origin}${pathname}`)
  }, [pathname])

  const value = {
    pathname,
    navigate,
  }

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return ctx
}

export function Link({ href, children, className = '', onClick, replace = false, ...rest }) {
  const { navigate, pathname } = useRouter()

  const handleClick = (e) => {
    // Abaikan jika modifier key ditekan (buka di tab baru)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return
    }

    // Jika external link
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      return
    }

    // Jika hash link di halaman yang sama
    if (href.startsWith('#')) {
      e.preventDefault()
      if (onClick) onClick(e)
      navigate(href)
      return
    }

    // Jika internal link
    e.preventDefault()
    if (onClick) onClick(e)
    navigate(href, { replace })
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  )
}
