export type Operator = '+' | '-' | '×' | '÷'

export interface CalculatorState {
  display: string
  previousValue: number | null
  operator: Operator | null
  waitingForOperand: boolean
  expression: string
}

export const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  expression: '',
}

const MAX_DISPLAY_LENGTH = 16

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  const str = Object.is(value, -0) ? '0' : String(value)
  if (str.length <= MAX_DISPLAY_LENGTH) return str
  const fixed = value.toPrecision(12)
  const trimmed = parseFloat(fixed).toString()
  if (trimmed.length <= MAX_DISPLAY_LENGTH) return trimmed
  return value.toExponential(6)
}

function parseDisplay(display: string): number {
  return parseFloat(display)
}

function compute(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      if (b === 0) return NaN
      return a / b
  }
}

export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'clearEntry' }
  | { type: 'backspace' }
  | { type: 'toggleSign' }
  | { type: 'percent' }
  | { type: 'sqrt' }

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case 'clear':
      return { ...initialState }

    case 'clearEntry':
      return {
        ...state,
        display: '0',
        waitingForOperand: false,
      }

    case 'backspace': {
      if (state.waitingForOperand) return state
      if (state.display === 'Error') return { ...initialState }
      if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
        return { ...state, display: '0' }
      }
      return { ...state, display: state.display.slice(0, -1) }
    }

    case 'toggleSign': {
      if (state.display === '0' || state.display === 'Error') return state
      if (state.display.startsWith('-')) {
        return { ...state, display: state.display.slice(1) }
      }
      return { ...state, display: `-${state.display}` }
    }

    case 'percent': {
      const current = parseDisplay(state.display)
      if (Number.isNaN(current)) return state
      const value =
        state.previousValue !== null && state.operator
          ? (state.previousValue * current) / 100
          : current / 100
      return {
        ...state,
        display: formatNumber(value),
        waitingForOperand: false,
      }
    }

    case 'sqrt': {
      if (state.display === 'Error') return state
      const current = parseDisplay(state.display)
      if (Number.isNaN(current)) return state
      const result = current < 0 ? NaN : Math.sqrt(current)
      const formatted = formatNumber(result)
      const operand = formatNumber(current)
      const expression = `√(${operand})`

      if (formatted === 'Error') {
        return { ...initialState, display: 'Error', expression }
      }

      return {
        ...state,
        display: formatted,
        expression,
        previousValue: null,
        operator: null,
        waitingForOperand: true,
      }
    }

    case 'digit': {
      if (state.display === 'Error') {
        return {
          ...initialState,
          display: action.digit,
        }
      }
      if (state.waitingForOperand) {
        return {
          ...state,
          display: action.digit,
          waitingForOperand: false,
        }
      }
      if (state.display === '0' && action.digit !== '0') {
        return { ...state, display: action.digit }
      }
      if (state.display === '0' && action.digit === '0') {
        return state
      }
      if (state.display.replace('-', '').replace('.', '').length >= MAX_DISPLAY_LENGTH) {
        return state
      }
      return { ...state, display: state.display + action.digit }
    }

    case 'decimal': {
      if (state.display === 'Error') return { ...initialState, display: '0.' }
      if (state.waitingForOperand) {
        return { ...state, display: '0.', waitingForOperand: false }
      }
      if (state.display.includes('.')) return state
      return { ...state, display: `${state.display}.` }
    }

    case 'operator': {
      const current = parseDisplay(state.display)
      if (state.display === 'Error') return state

      if (state.previousValue === null) {
        return {
          ...state,
          previousValue: current,
          operator: action.operator,
          waitingForOperand: true,
          expression: `${formatNumber(current)} ${action.operator}`,
        }
      }

      if (state.waitingForOperand) {
        return {
          ...state,
          operator: action.operator,
          expression: `${formatNumber(state.previousValue)} ${action.operator}`,
        }
      }

      const result = compute(state.previousValue, current, state.operator!)
      const formatted = formatNumber(result)
      if (formatted === 'Error') {
        return { ...initialState, display: 'Error' }
      }

      return {
        display: formatted,
        previousValue: result,
        operator: action.operator,
        waitingForOperand: true,
        expression: `${formatted} ${action.operator}`,
      }
    }

    case 'equals': {
      if (state.operator === null || state.previousValue === null || state.waitingForOperand) {
        return state
      }
      const current = parseDisplay(state.display)
      const result = compute(state.previousValue, current, state.operator)
      const formatted = formatNumber(result)
      const expr = `${formatNumber(state.previousValue)} ${state.operator} ${formatNumber(current)} =`

      if (formatted === 'Error') {
        return { ...initialState, display: 'Error', expression: expr }
      }

      return {
        display: formatted,
        previousValue: null,
        operator: null,
        waitingForOperand: true,
        expression: expr,
      }
    }

    default:
      return state
  }
}

export function mapKeyboardToAction(key: string): CalculatorAction | null {
  if (/^[0-9]$/.test(key)) return { type: 'digit', digit: key }
  if (key === '.') return { type: 'decimal' }
  if (key === '+') return { type: 'operator', operator: '+' }
  if (key === '-') return { type: 'operator', operator: '-' }
  if (key === '*') return { type: 'operator', operator: '×' }
  if (key === '/') return { type: 'operator', operator: '÷' }
  if (key === 'Enter' || key === '=') return { type: 'equals' }
  if (key === 'Escape') return { type: 'clear' }
  if (key === 'Backspace') return { type: 'backspace' }
  if (key === '%') return { type: 'percent' }
  return null
}
