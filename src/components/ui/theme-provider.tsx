'use client'

import { createContext, useContext, useLayoutEffect, useState } from 'react'

type ThemeContextValue = {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // On mount: resolve theme from localStorage / system preference
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      const resolved: 'light' | 'dark' =
        stored === 'light' ? 'light' :
        stored === 'dark' ? 'dark' :
        window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(resolved)
    } catch {
      // localStorage unavailable — default 'dark' from useState remains
    }
  }, [])

  // Sync .dark class on <html> whenever theme changes (runs before paint)
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', next)
      } catch {}
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
