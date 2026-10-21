import Calculator from './components/Calculator'
import { useTheme } from './hooks/useTheme'
import './App.css'

function App() {
  const { theme, preference, setPreference } = useTheme()

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Calculator</h1>
        <div className="theme-control" role="group" aria-label="Theme">
          <span className="theme-label">
            {theme === 'light' ? 'Day' : 'Night'}
          </span>
          <select
            className="theme-select"
            value={preference}
            onChange={(e) =>
              setPreference(e.target.value as 'auto' | 'light' | 'dark')
            }
            aria-label="Theme mode"
          >
            <option value="auto">Auto (day / night)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </header>
      <main>
        <Calculator />
      </main>
    </div>
  )
}

export default App
