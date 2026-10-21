import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export type ThemePreference = 'auto' | Theme

const STORAGE_KEY = 'calculator-theme-preference'

/** Daytime 6:00–17:59 → light; otherwise dark */
export function getThemeFromTime(date = new Date()): Theme {
  const hour = date.getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}

function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'auto') return raw
  } catch {
    /* ignore */
  }
  return 'auto'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window !== 'undefined' ? readStoredPreference() : 'auto',
  )
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== 'undefined'
      ? preference === 'auto'
        ? getThemeFromTime()
        : preference
      : 'light',
  )

  const resolveTheme = useCallback(
    (pref: ThemePreference): Theme => (pref === 'auto' ? getThemeFromTime() : pref),
    [],
  )

  useEffect(() => {
    const resolved = resolveTheme(preference)
    setTheme(resolved)
    applyTheme(resolved)
  }, [preference, resolveTheme])

  useEffect(() => {
    if (preference !== 'auto') return

    const tick = () => {
      const next = getThemeFromTime()
      setTheme(next)
      applyTheme(next)
    }

    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [preference])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  return { theme, preference, setPreference }
}
