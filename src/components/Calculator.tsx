import { useCallback, useEffect, useReducer } from 'react'
import {
  calculatorReducer,
  initialState,
  mapKeyboardToAction,
  type CalculatorAction,
  type Operator,
} from '../calculator/engine'
import './Calculator.css'

type ButtonKind = 'digit' | 'operator' | 'function' | 'equals' | 'zero'

interface KeyDef {
  label: string
  kind: ButtonKind
  action: CalculatorAction
  wide?: boolean
}

const KEYS: KeyDef[] = [
  { label: 'AC', kind: 'function', action: { type: 'clear' } },
  { label: 'CE', kind: 'function', action: { type: 'clearEntry' } },
  { label: '⌫', kind: 'function', action: { type: 'backspace' } },
  { label: '÷', kind: 'operator', action: { type: 'operator', operator: '÷' } },
  { label: '7', kind: 'digit', action: { type: 'digit', digit: '7' } },
  { label: '8', kind: 'digit', action: { type: 'digit', digit: '8' } },
  { label: '9', kind: 'digit', action: { type: 'digit', digit: '9' } },
  { label: '×', kind: 'operator', action: { type: 'operator', operator: '×' } },
  { label: '4', kind: 'digit', action: { type: 'digit', digit: '4' } },
  { label: '5', kind: 'digit', action: { type: 'digit', digit: '5' } },
  { label: '6', kind: 'digit', action: { type: 'digit', digit: '6' } },
  { label: '−', kind: 'operator', action: { type: 'operator', operator: '-' } },
  { label: '1', kind: 'digit', action: { type: 'digit', digit: '1' } },
  { label: '2', kind: 'digit', action: { type: 'digit', digit: '2' } },
  { label: '3', kind: 'digit', action: { type: 'digit', digit: '3' } },
  { label: '+', kind: 'operator', action: { type: 'operator', operator: '+' } },
  { label: '±', kind: 'function', action: { type: 'toggleSign' } },
  { label: '0', kind: 'zero', action: { type: 'digit', digit: '0' }, wide: true },
  { label: '.', kind: 'digit', action: { type: 'decimal' } },
  { label: '%', kind: 'function', action: { type: 'percent' } },
  { label: '=', kind: 'equals', action: { type: 'equals' } },
]

function operatorSymbol(op: Operator): string {
  return op
}

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState)

  const handleAction = useCallback((action: CalculatorAction) => {
    dispatch(action)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.shiftKey) e.preventDefault()
      const action = mapKeyboardToAction(e.key)
      if (action) {
        e.preventDefault()
        dispatch(action)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <div className="display" aria-live="polite" aria-atomic="true">
        <div className="display-expression" title={state.expression}>
          {state.expression ||
            (state.operator && state.previousValue !== null
              ? `${state.previousValue} ${operatorSymbol(state.operator)}`
              : '\u00A0')}
        </div>
        <div className="display-value">{state.display}</div>
      </div>
      <div className="keypad">
        {KEYS.map((key) => (
          <button
            key={key.label + (key.wide ? '-wide' : '')}
            type="button"
            className={[
              'key',
              `key--${key.kind}`,
              key.wide ? 'key--wide' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleAction(key.action)}
            aria-label={key.label}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  )
}
