'use client'

import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      className="text-primary min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium"
    >
      {label}
    </button>
  )
}
