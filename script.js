// Simple calculator logic
const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

let expression = '';   // internal expression using JS operators (*, /)
let justEvaluated = false;

const operatorMap = {
  '×': '*',
  '÷': '/',
  '−': '-',
  '-': '-',
  '+': '+'
};

function updateDisplay(text) {
  displayEl.textContent = text || '0';
}

function appendToExpression(value, shownValue = value) {
  if (justEvaluated && /[0-9.]/.test(value)) {
    // start new number after result if user types digit/dot
    expression = '';
    justEvaluated = false;
  }
  expression += value;
  updateDisplay(shownValue === undefined ? expression : shownValueDisplay(expression));
}

function shownValueDisplay(expr) {
  // convert internal * and / back to symbols for display
  return expr.replace(/\*/g, '×').replace(/\//g, '÷');
}

function clearAll() {
  expression = '';
  justEvaluated = false;
  updateDisplay('0');
}

function backspace() {
  if (expression.length === 0) return;
  expression = expression.slice(0, -1);
  updateDisplay(expression.length ? shownValueDisplay(expression) : '0');
}

function handleDigit(d) {
  // Prevent multiple dots in the current number segment
  if (d === '.') {
    // find last operator position
    const lastOperatorPos = Math.max(
      expression.lastIndexOf('+'),
      expression.lastIndexOf('-'),
      expression.lastIndexOf('*'),
      expression.lastIndexOf('/'),
      expression.lastIndexOf('('),
      expression.lastIndexOf(')')
    );
    const segment = expression.slice(lastOperatorPos + 1);
    if (segment.includes('.')) return;
    if (segment === '') {
      // leading dot -> "0."
      appendToExpression('0.');
      return;
    }
  }
  appendToExpression(d);
}

function handleOperator(opSymbol) {
  const op = operatorMap[opSymbol] || opSymbol;
  if (expression === '' && op === '-') {
    // allow unary minus at start
    appendToExpression('-');
    return;
  }
  // Replace trailing operator with new one
  if (/[+\-*/]$/.test(expression)) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }
  justEvaluated = false;
  updateDisplay(shownValueDisplay(expression));
}

function handleParen(symbol) {
  expression += symbol;
  updateDisplay(shownValueDisplay(expression));
}

function evaluateExpression() {
  if (!expression) return;
  // Validation: allow only digits, operators, parentheses and dots
  if (!/^[0-9+\-*/().]+$/.test(expression)) {
    updateDisplay('Error');
    expression = '';
    return;
  }
  try {
    // Use Function instead of eval to evaluate safely-ish
    const result = Function('"use strict"; return (' + expression + ')')();
    if (!isFinite(result)) {
      updateDisplay('Error');
      expression = '';
      return;
    }
    // Trim trailing .0 where applicable
    const out = Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(12)).toString());
    updateDisplay(out);
    expression = String(result); // allow chaining
    justEvaluated = true;
  } catch (e) {
    updateDisplay('Error');
    expression = '';
  }
}

// Button click handling
keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'digit':
      handleDigit(value);
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'equals':
      evaluateExpression();
      break;
    case 'clear':
      clearAll();
      break;
    case 'backspace':
      backspace();
      break;
    case 'paren':
      handleParen(value);
      break;
    default:
      break;
  }
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((key >= '0' && key <= '9') || key === '.') {
    e.preventDefault();
    handleDigit(key);
    return;
  }
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    evaluateExpression();
    return;
  }
  if (key === 'Backspace') {
    e.preventDefault();
    backspace();
    return;
  }
  if (key === 'Escape') {
    e.preventDefault();
    clearAll();
    return;
  }
  const keyToSymbol = {
    '/': '÷',
    '*': '×',
    '-': '-',
    '+': '+',
    '(': '(',
    ')': ')'
  };
  if (key in keyToSymbol) {
    e.preventDefault();
    const sym = keyToSymbol[key];
    if (sym === '(' || sym === ')') handleParen(sym);
    else handleOperator(sym);
  }
});

// initialize
updateDisplay('0');