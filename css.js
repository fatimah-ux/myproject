let currentExpression = '';
let currentResult = '0';
let isDegMode = true;
let memoryValue = 0;
let history = [];

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const angleBtn = document.getElementById('angle-mode-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const historyList = document.getElementById('history-list');

// --- Tukar Mod DEG / RAD ---
angleBtn.addEventListener('click', () => {
    isDegMode = !isDegMode;
    angleBtn.textContent = isDegMode ? 'DEG' : 'RAD';
});

// --- Tukar Tema Dark/Light ---
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.body.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// --- Kawalan Input ---
function appendValue(val) {
    currentExpression += val;
    updateDisplay();
}

function appendFunction(funcName) {
    currentExpression += funcName;
    updateDisplay();
}

function clearAll() {
    currentExpression = '';
    currentResult = '0';
    updateDisplay();
}

function deleteChar() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function toggleSign() {
    if (currentExpression.startsWith('-')) {
        currentExpression = currentExpression.slice(1);
    } else {
        currentExpression = '-' + currentExpression;
    }
    updateDisplay();
}

function updateDisplay() {
    expressionEl.textContent = currentExpression;
    resultEl.textContent = currentResult;
}

// --- Fungsi Matematik Saintifik ---
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function toRadians(angle) {
    return isDegMode ? angle * (Math.PI / 180) : angle;
}

function toDegrees(rad) {
    return isDegMode ? rad * (180 / Math.PI) : rad;
}

// --- Pengiraan Utama ---
function calculate() {
    if (!currentExpression) return;

    try {
        let parsed = currentExpression
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**')
            .replace(/%/g, '/100');

        // Fungsi Trigonometri & Log
        parsed = parsed.replace(/sin\(([^)]+)\)/g, (match, p1) => `Math.sin(toRadians(${p1}))`);
        parsed = parsed.replace(/cos\(([^)]+)\)/g, (match, p1) => `Math.cos(toRadians(${p1}))`);
        parsed = parsed.replace(/tan\(([^)]+)\)/g, (match, p1) => `Math.tan(toRadians(${p1}))`);
        
        parsed = parsed.replace(/asin\(([^)]+)\)/g, (match, p1) => `toDegrees(Math.asin(${p1}))`);
        parsed = parsed.replace(/acos\(([^)]+)\)/g, (match, p1) => `toDegrees(Math.acos(${p1}))`);
        parsed = parsed.replace(/atan\(([^)]+)\)/g, (match, p1) => `toDegrees(Math.atan(${p1}))`);

        parsed = parsed.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
        parsed = parsed.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
        parsed = parsed.replace(/fact\(([^)]+)\)/g, 'factorial($1)');

        // Gunakan Function pembina untuk pengiraan selamat (ganti eval)
        let evalResult = new Function('toRadians', 'toDegrees', 'factorial', `return ${parsed}`)(toRadians, toDegrees, factorial);

        if (typeof evalResult === 'number' && !isNaN(evalResult)) {
            // Hilangkan ralat pengapungan perpuluhan
            evalResult = Math.round(evalResult * 1e10) / 1e10;
            
            addHistory(currentExpression, evalResult);
            currentResult = evalResult.toString();
            currentExpression = currentResult;
        } else {
            currentResult = 'Error';
        }
    } catch (e) {
        currentResult = 'Error';
    }

    updateDisplay();
}

// --- Fungsi Memori ---
function handleMemory(type) {
    const val = parseFloat(currentResult) || 0;
    switch (type) {
        case 'MC': memoryValue = 0; break;
        case 'MR': currentExpression += memoryValue.toString(); break;
        case 'M+': memoryValue += val; break;
        case 'M-': memoryValue -= val; break;
    }
    updateDisplay();
}

// --- Sejarah ---
function addHistory(expr, res) {
    history.unshift({ expr, res });
    if (history.length > 5) history.pop();
    renderHistory();
}

function clearHistory() {
    history = [];
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-msg">Tiada rekod sejarah</li>';
        return;
    }
    historyList.innerHTML = history.map(item => `
        <li class="history-item" onclick="useHistory('${item.res}')">
            <span>${item.expr}</span>
            <strong>= ${item.res}</strong>
        </li>
    `).join('');
}

function useHistory(val) {
    currentExpression = val;
    updateDisplay();
}

// --- Sokongan Papan Kekunci (Keyboard) ---
document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key >= '0' && key <= '9') appendValue(key);
    else if (key === '.') appendValue('.');
    else if (key === '+') appendValue('+');
    else if (key === '-') appendValue('-');
    else if (key === '*') appendValue('*');
    else if (key === '/') appendValue('/');
    else if (key === '(') appendValue('(');
    else if (key === ')') appendValue(')');
    else if (key === '^') appendValue('^');
    else if (key === 'Enter') { e.preventDefault(); calculate(); }
    else if (key === 'Backspace') deleteChar();
    else if (key === 'Escape') clearAll();
});